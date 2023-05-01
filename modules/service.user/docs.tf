resource "aws_api_gateway_documentation_part" "register_method" {
  location {
    type        = "METHOD"
    method      = aws_api_gateway_method.register-method.http_method
    path        = aws_api_gateway_resource.register-api-resource.path
  }

  rest_api_id = var.api_gateway_id
  properties = jsonencode({
    "tags"        : ["User", "Registration"],
    "summary"     : "Register a new user",
    "description" : "This endpoint registers a new user by creating an account and sending a confirmation email.",
    "operationId" : "registerUser",
    "requestBody" : {
      "required" : true,
      "content"  : {
        "application/json" : {
          "schema" : {
            "type" : "object",
            "properties" : {
              "username" : {
                "type" : "string"
              },
              "email" : {
                "type" : "string"
              },
              "password" : {
                "type" : "string"
              }
            },
            "required" : ["username", "email", "password"]
          }
        }
      }
    },
    "responses" : {
      "200" : {
        "description" : "User created successfully",
        "content"     : {
          "application/json" : {
            "schema" : {
              "type" : "object",
              "properties" : {
                "message" : {
                  "type" : "string"
                }
              }
            }
          }
        }
      },
      "400" : {
        "description" : "Bad request (e.g. invalid input, missing required parameters)",
        "content"     : {
          "application/json" : {
            "schema" : {
              "type" : "object",
              "properties" : {
                "message" : {
                  "type" : "string"
                }
              }
            }
          }
        }
      }
    }
  })
}

resource "aws_api_gateway_documentation_part" "reset_password_method" {
  location {
    type        = "METHOD"
    method      = aws_api_gateway_method.reset-password-method.http_method
    path        = aws_api_gateway_resource.reset-password-api-resource.path
  }

  rest_api_id = var.api_gateway_id
  properties = jsonencode({
    "tags"        : ["User", "Password"],
    "summary"     : "Reset user password",
    "description" : "This endpoint generates a reset password code and sends it to the user's email address.",
    "operationId" : "resetPassword",
    "requestBody" : {
      "required" : true,
      "content"  : {
        "application/json" : {
          "schema" : {
            "type" : "object",
            "properties" : {
              "email" : {
                "type" : "string"
              }
            },
            "required" : ["email"]
          }
        }
      }
    },
    "responses" : {
      "200" : {
        "description" : "Reset password code sent",
        "content"     : {
          "application/json" : {
            "schema" : {
              "type" : "object",
              "properties" : {
                "message" : {
                  "type" : "string"
                }
              }
            }
          }
        }
      },
      "400" : {
        "description" : "Bad request (e.g. invalid input, missing required parameters)",
        "content"     : {
          "application/json" : {
            "schema" : {
              "type" : "object",
              "properties" : {
                "message" : {
                  "type" : "string"
                }
              }
            }
          }
        }
      }
    }
  })
}
resource "aws_api_gateway_documentation_part" "login_method" {
  location {
    type        = "METHOD"
    method      = aws_api_gateway_method.login-method.http_method
    path        = aws_api_gateway_resource.login-api-resource.path
  }

  rest_api_id = var.api_gateway_id
  properties = jsonencode({
    "tags"        : ["User", "Authentication"],
    "summary"     : "Authenticate a user",
    "description" : "This endpoint verifies the user's password, checks if the user is confirmed, and generates an access token for the user upon successful authentication.",
    "operationId" : "logon",
    "requestBody" : {
      "required" : true,
      "content"  : {
        "application/json" : {
          "schema" : {
            "type" : "object",
            "properties" : {
              "username" : {
                "type" : "string"
              },
              "password" : {
                "type" : "string"
              }
            },
            "required" : ["username", "password"]
          }
        }
      }
    },
    "responses" : {
      "200" : {
        "description" : "Successful authentication",
        "content"     : {
          "application/json" : {
            "schema" : {
              "type" : "object",
              "properties" : {
                "access_token" : {
                  "type" : "string"
                }
              }
            }
          }
        }
      },
      "400" : {
        "description" : "Bad request (e.g. invalid input, missing required parameters, unauthorized)",
        "content"     : {
          "application/json" : {
            "schema" : {
              "type" : "object",
              "properties" : {
                "message" : {
                  "type" : "string"
                }
              }
            }
          }
        }
      }
    }
  })
}

resource "aws_api_gateway_documentation_part" "list_access_keys_method" {
  location {
    type        = "METHOD"
    method      = aws_api_gateway_method.list-access-keys-method.http_method
    path        = aws_api_gateway_resource.access-keys-api-resource.path
  }

  rest_api_id = var.api_gateway_id
  properties = jsonencode({
    "tags"        : ["User", "Access Keys"],
    "summary"     : "List access keys",
    "description" : "This endpoint retrieves the access keys associated with the authenticated user.",
    "operationId" : "listAccessKeys",
    "responses"   : {
      "200" : {
        "description" : "Successful retrieval of access keys",
        "content"     : {
          "application/json" : {
            "schema" : {
              "type"       : "object",
              "properties" : {
                "access_keys" : {
                  "type"  : "array",
                  "items" : {
                    "type" : "string"
                  }
                }
              }
            }
          }
        }
      },
      "400" : {
        "description" : "Bad request (e.g. invalid input, missing required parameters, unauthorized)",
        "content"     : {
          "application/json" : {
            "schema" : {
              "type"       : "object",
              "properties" : {
                "message" : {
                  "type" : "string"
                }
              }
            }
          }
        }
      }
    }
  })
}

resource "aws_api_gateway_documentation_part" "generate_user_access_key" {
  location {
    type        = "METHOD"
    method      = aws_api_gateway_method.generate-access-key-method.http_method
    path        = aws_api_gateway_resource.access-keys-api-resource.path
  }

  rest_api_id = var.api_gateway_id
  properties = jsonencode({
    "tags"        : ["User", "Access Keys"],
    "summary"     : "Generate user access key",
    "description" : "This endpoint generates a new access key and secret key for the authenticated user.",
    "operationId" : "generateUserAccessKey",
    "responses"   : {
      "200" : {
        "description" : "Successful generation of access key and secret key",
        "content"     : {
          "application/json" : {
            "schema" : {
              "type"       : "object",
              "properties" : {
                "message"           : { "type" : "string" },
                "access_key"        : { "type" : "string" },
                "secret_access_key" : { "type" : "string" }
              }
            }
          }
        }
      },
      "400" : {
        "description" : "Bad request (e.g. invalid input, missing required parameters, unauthorized)",
        "content"     : {
          "application/json" : {
            "schema" : {
              "type"       : "object",
              "properties" : {
                "message" : {
                  "type" : "string"
                }
              }
            }
          }
        }
      }
    }
  })
}

resource "aws_api_gateway_documentation_part" "delete_access_key" {
  location {
    type        = "METHOD"
    method      = aws_api_gateway_method.delete-access-key-method.http_method
    path        = aws_api_gateway_resource.delete-access-key-api-resource.path
  }

  rest_api_id = var.api_gateway_id
  properties = jsonencode({
    "tags"        : ["User", "Access Keys"],
    "summary"     : "Delete user access key",
    "description" : "This endpoint deletes the specified access key for the authenticated user.",
    "operationId" : "deleteAccessKey",
    "parameters"  : [
      {
        "name"        : "accessKey",
        "in"          : "path",
        "description" : "The access key to be deleted.",
        "required"    : true,
        "schema"      : {
          "type" : "string"
        }
      }
    ],
    "responses"   : {
      "200" : {
        "description" : "Successful deletion of the access key",
        "content"     : {
          "application/json" : {
            "schema" : {
              "type"       : "object",
              "properties" : {
                "message" : { "type" : "string" }
              }
            }
          }
        }
      },
      "400" : {
        "description" : "Bad request (e.g. invalid input, missing required parameters, unauthorized)",
        "content"     : {
          "application/json" : {
            "schema" : {
              "type"       : "object",
              "properties" : {
                "message" : {
                  "type" : "string"
                }
              }
            }
          }
        }
      }
    }
  })
}

resource "aws_api_gateway_documentation_part" "confirm_user" {
  location {
    type        = "METHOD"
    method      = aws_api_gateway_method.confirm-method.http_method
    path        = aws_api_gateway_resource.confirm-api-resource.path
  }

  rest_api_id = var.api_gateway_id
  properties = jsonencode({
    "tags"        : ["User", "Account Confirmation"],
    "summary"     : "Confirm user account",
    "description" : "This endpoint confirms a user's account using the provided confirmation code.",
    "operationId" : "confirmUserAccount",
    "parameters"  : [
      {
        "name"        : "code",
        "in"          : "query",
        "description" : "The account confirmation code.",
        "required"    : true,
        "schema"      : {
          "type" : "string"
        }
      }
    ],
    "responses"   : {
      "200" : {
        "description" : "Successful account confirmation",
        "content"     : {
          "application/json" : {
            "schema" : {
              "type"       : "object",
              "properties" : {
                "message" : { "type" : "string" }
              }
            }
          }
        }
      },
      "400" : {
        "description" : "Bad request (e.g. invalid input, missing required parameters, unauthorized)",
        "content"     : {
          "application/json" : {
            "schema" : {
              "type"       : "object",
              "properties" : {
                "message" : {
                  "type" : "string"
                }
              }
            }
          }
        }
      }
    }
  })
}

resource "aws_api_gateway_documentation_part" "confirm_new_password" {
  location {
    type        = "METHOD"
    method      = aws_api_gateway_method.confirm-new-password-method.http_method
    path        = aws_api_gateway_resource.confirm-new-password-api-resource.path
  }

  rest_api_id = var.api_gateway_id
  properties = jsonencode({
    "tags"        : ["User", "Password Reset"],
    "summary"     : "Reset password",
    "description" : "This endpoint resets the user's password using the provided reset code and new password.",
    "operationId" : "confirmNewPassword",
    "requestBody" : {
      "description" : "JSON object containing new password and reset code",
      "required"    : true,
      "content"     : {
        "application/json" : {
          "schema" : {
            "type"       : "object",
            "properties" : {
              "password" : {
                "type"        : "string",
                "description" : "The new password"
              },
              "code" : {
                "type"        : "string",
                "description" : "The password reset code"
              }
            },
            "required" : ["password", "code"]
          }
        }
      }
    },
    "responses"   : {
      "200" : {
        "description" : "Successful password reset",
        "content"     : {
          "application/json" : {
            "schema" : {
              "type"       : "object",
              "properties" : {
                "message" : { "type" : "string" }
              }
            }
          }
        }
      },
      "400" : {
        "description" : "Bad request (e.g. invalid input, missing required parameters, unauthorized)",
        "content"     : {
          "application/json" : {
            "schema" : {
              "type"       : "object",
              "properties" : {
                "message" : {
                  "type" : "string"
                }
              }
            }
          }
        }
      }
    }
  })
}

resource "aws_api_gateway_documentation_part" "confirm_change_email" {
  location {
    type        = "METHOD"
    method      = aws_api_gateway_method.confirm_change_email_method.http_method
    path        = aws_api_gateway_resource.confirm_change_email_api_resource.path
  }

  rest_api_id = var.api_gateway_id
  properties = jsonencode({
    "tags"        : ["User", "Email Change"],
    "summary"     : "Confirm email change",
    "description" : "This endpoint confirms the email change request using the provided email change code.",
    "operationId" : "confirmChangeEmail",
    "parameters"  : [
      {
        "name"        : "code",
        "in"          : "query",
        "description" : "The email change code",
        "required"    : true,
        "schema"      : { "type" : "string" }
      }
    ],
    "responses"   : {
      "200" : {
        "description" : "Successful email change",
        "content"     : {
          "application/json" : {
            "schema" : {
              "type"       : "object",
              "properties" : {
                "message" : { "type" : "string" }
              }
            }
          }
        }
      },
      "400" : {
        "description" : "Bad request (e.g. invalid input, missing required parameters, unauthorized)",
        "content"     : {
          "application/json" : {
            "schema" : {
              "type"       : "object",
              "properties" : {
                "message" : {
                  "type" : "string"
                }
              }
            }
          }
        }
      }
    }
  })
}

resource "aws_api_gateway_documentation_part" "change_email" {
  location {
    type        = "METHOD"
    method      = aws_api_gateway_method.change-email-method.http_method
    path        = aws_api_gateway_resource.change-email-api-resource.path
  }

  rest_api_id = var.api_gateway_id
  properties = jsonencode({
    "tags"        : ["User", "Email Change"],
    "summary"     : "Request email change",
    "description" : "This endpoint processes an email change request, generates a confirmation code, and sends emails to the old and new email addresses.",
    "operationId" : "changeEmail",
    "requestBody" : {
      "required" : true,
      "content"  : {
        "application/json" : {
          "schema" : {
            "type"       : "object",
            "properties" : {
              "email" : {
                "type"        : "string",
                "description" : "The new email address",
                "format"      : "email"
              }
            }
          }
        }
      }
    },
    "responses"   : {
      "200" : {
        "description" : "Email change request processed",
        "content"     : {
          "application/json" : {
            "schema" : {
              "type"       : "object",
              "properties" : {
                "message" : { "type" : "string" }
              }
            }
          }
        }
      },
      "400" : {
        "description" : "Bad request (e.g. invalid input, missing required parameters, unauthorized)",
        "content"     : {
          "application/json" : {
            "schema" : {
              "type"       : "object",
              "properties" : {
                "message" : {
                  "type" : "string"
                }
              }
            }
          }
        }
      }
    }
  })
}

resource "aws_api_gateway_documentation_part" "cancel_change_email" {
  location {
    type        = "METHOD"
    method      = aws_api_gateway_method.cancel_change_email_method.http_method
    path        = aws_api_gateway_resource.cancel_change_email_api_resource.path
  }

  rest_api_id = var.api_gateway_id
  properties = jsonencode({
    "tags"        : ["User", "Email Change"],
    "summary"     : "Cancel email change request",
    "description" : "This endpoint cancels an email change request by deleting the pendingEmail and changeEmailCode metadata for the user.",
    "operationId" : "cancelChangeEmail",
    "parameters"  : [
      {
        "name"        : "code",
        "in"          : "query",
        "required"    : true,
        "description" : "The email change code",
        "schema"      : { "type" : "string" }
      }
    ],
    "responses"   : {
      "200" : {
        "description" : "Email change request cancelled",
        "content"     : {
          "application/json" : {
            "schema" : {
              "type"       : "object",
              "properties" : {
                "message" : { "type" : "string" }
              }
            }
          }
        }
      },
      "400" : {
        "description" : "Bad request (e.g. invalid input, missing required parameters, unauthorized)",
        "content"     : {
          "application/json" : {
            "schema" : {
              "type"       : "object",
              "properties" : {
                "message" : {
                  "type" : "string"
                }
              }
            }
          }
        }
      }
    }
  })
}

