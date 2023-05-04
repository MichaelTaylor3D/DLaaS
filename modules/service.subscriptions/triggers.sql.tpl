CREATE TRIGGER generate_invoice_guid
BEFORE INSERT ON ${db_name}.invoices
FOR EACH ROW
BEGIN
  SET NEW.guid = UUID();
END;
