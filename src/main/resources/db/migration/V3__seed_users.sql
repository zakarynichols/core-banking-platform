INSERT INTO users (username, email, password, full_name, role)
VALUES
    ('admin',    'admin@bank.com',    '$2b$10$wdcvdbPW73TG1qaF.G/MzOx9vOmtoXSI/6ywfEJThwSLYjetA2VZq', 'Admin User',    'ADMIN'),
    ('employee', 'employee@bank.com', '$2b$10$908f1hffHZ7aH6xOucYlTuXZc/xlplsDgGshXDdqMB2gdmISLZcDO', 'Employee User', 'EMPLOYEE'),
    ('customer', 'customer@bank.com', '$2b$10$NGJvafjmqfYlkVLxQGLNCuNvZAnMlpowy783xJODvAOaqm.zJ9g0G', 'Customer User', 'CUSTOMER')
ON CONFLICT (username) DO NOTHING;
