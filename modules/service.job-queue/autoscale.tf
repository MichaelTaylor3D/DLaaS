resource "aws_launch_configuration" "job-queue-worker-launch-configuration" {
  name_prefix          = "job-queue-worker-launch-config-"
  image_id             = var.worker_ami

  #instance_type        = "g4dn.xlarge"
  instance_type        = "p2.xlarge"
  security_groups      = [var.allow_ssh_security_group_id]
  key_name             = "PolaeServicesPhysicalKey"

  #root_block_device {
  #  volume_type           = "io1"
  #  volume_size           = 140
  #  iops                  = 7000
  #  delete_on_termination = true
  #}

  # redeploying fails unless this is added
  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_autoscaling_group" "job-queue-worker-autoscaling-group" {
  name                      = "job-queue-worker-autoscaling-group"
  vpc_zone_identifier       = [var.public_subnet_id]
  launch_configuration      = aws_launch_configuration.job-queue-worker-launch-configuration.name
  min_size                  = 0
  max_size                  = 18
  health_check_grace_period = 180
  health_check_type         = "EC2"
  force_delete              = true

  #warm_pool {
  #  pool_state                  = "Stopped"
  #  min_size                    = 1
  #  max_group_prepared_capacity = 1
  #}

  tag {
    key                 = "Name"
    value               = "job-queue-clonegan.worker"
    propagate_at_launch = true
  }

  termination_policies = [
    "NewestInstance"
  ]
}

resource "aws_autoscaling_policy" "job-queue-scale-out-policy" {
    name                   = "job-queue-scale-out-policy"
    autoscaling_group_name = aws_autoscaling_group.job-queue-worker-autoscaling-group.name
    scaling_adjustment     = "1"
    adjustment_type        = "ChangeInCapacity"
}

resource "aws_autoscaling_policy" "job-queue-scale-in-policy" {
    name                   = "job-queue-scale-in-policy"
    autoscaling_group_name = aws_autoscaling_group.job-queue-worker-autoscaling-group.name
    scaling_adjustment     = "-100"
    adjustment_type        = "ChangeInCapacity"
    cooldown               = 60
}

resource "aws_cloudwatch_metric_alarm" "increase-capacity-to-job-queue" {
    alarm_name             = "increase-job-queue-capacity"
    alarm_description      = "${var.aws_profile}: This metric monitors queue increases"
    metric_name            = "ApproximateNumberOfMessagesVisible"
    namespace              = "AWS/SQS"
    comparison_operator    = "GreaterThanOrEqualToThreshold"
    threshold              = "1"
    statistic              = "Average"
    evaluation_periods     = "1"
    period                 = "60"
    alarm_actions          = [aws_autoscaling_policy.job-queue-scale-out-policy.arn]
    dimensions = {
      QueueName = aws_sqs_queue.job-queue-fifo.name
    }
}

resource "aws_cloudwatch_metric_alarm" "decrease-capacity-to-job-queue" {
    alarm_name             = "decrease-job-queue-capacity"
    alarm_description      = "${var.aws_profile}: : This metric monitors queue decreases"
    metric_name            = "ApproximateNumberOfMessagesVisible"
    namespace              = "AWS/SQS"
    comparison_operator    = "LessThanOrEqualToThreshold"
    threshold              = "1"
    statistic              = "Average"
    evaluation_periods     = "1"
    period                 = "120"
    actions_enabled        = true
    alarm_actions          = [aws_autoscaling_policy.job-queue-scale-in-policy.arn]

    dimensions = {
      QueueName = aws_sqs_queue.job-queue-fifo.name
    }
}

resource "aws_s3_bucket_object" "autoscale-config" {
  bucket = var.dev_bucket_id
  key    = "configurations/autoscale.config.json"
  content_type = "application/json"
  content = <<EOF
  {  
    "AutoScalingGroupName": "${aws_autoscaling_group.job-queue-worker-autoscaling-group.name}",
    "ScaleInPolicyName": "${aws_autoscaling_policy.job-queue-scale-in-policy.name}",
    "ScaleOutPolicyName": "${aws_autoscaling_policy.job-queue-scale-out-policy.name}"
  }
  EOF
}
