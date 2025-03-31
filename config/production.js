module.exports = {
    // Server Configuration
    port: process.env.PORT || 3001,
    nodeEnv: 'production',
    
    // Database Configuration
    database: {
        user: process.env.DB_USER,
        host: process.env.DB_HOST,
        database: process.env.DB_NAME,
        password: process.env.DB_PASSWORD,
        port: process.env.DB_PORT,
        ssl: { rejectUnauthorized: false }, // Required for production
        max: 20, // Maximum number of connections in pool
        idleTimeoutMillis: 30000
    },
    
    // Redis Configuration
    redis: {
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT,
        password: process.env.REDIS_PASSWORD,
        tls: true // Enable TLS for Redis
    },
    
    // Security Configuration
    security: {
        jwtSecret: process.env.JWT_SECRET,
        jwtExpiresIn: '24h',
        corsOrigin: process.env.FRONTEND_URL,
        rateLimit: {
            windowMs: 15 * 60 * 1000, // 15 minutes
            max: 100 // limit each IP to 100 requests per windowMs
        }
    },
    
    // Email Configuration
    email: {
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: true,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        },
        from: process.env.SMTP_FROM
    },
    
    // Logging Configuration
    logging: {
        level: 'info',
        filename: 'logs/production.log',
        maxsize: 5242880, // 5MB
        maxFiles: 5
    },
    
    // Monitoring Configuration
    monitoring: {
        sentryDsn: process.env.SENTRY_DSN,
        enablePerformanceMonitoring: true
    }
}; 