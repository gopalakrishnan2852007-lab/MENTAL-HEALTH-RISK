const pool = require('../config/db');

const initDb = async () => {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS Students (
                id SERIAL PRIMARY KEY,
                student_id VARCHAR(50) UNIQUE NOT NULL,
                name VARCHAR(100) NOT NULL,
                major VARCHAR(100),
                year_of_study INTEGER,
                gpa DECIMAL(3, 2)
            );
        `);
        console.log('✅ Students table created');

        await pool.query(`
            CREATE TABLE IF NOT EXISTS MentalHealthData (
                id SERIAL PRIMARY KEY,
                student_id INTEGER REFERENCES Students(id) ON DELETE CASCADE,
                attendance_rate DECIMAL(5, 2),
                grades_trend DECIMAL(5, 2),
                sleep_hours_reported DECIMAL(4, 2),
                recent_life_events_score INTEGER,
                system_logins_late_night INTEGER,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('✅ MentalHealthData table created');

        await pool.query(`
            CREATE TABLE IF NOT EXISTS AI_Risk_Assessment (
                id SERIAL PRIMARY KEY,
                student_id INTEGER REFERENCES Students(id) ON DELETE CASCADE,
                risk_level VARCHAR(50),
                sentiment_score DECIMAL(5, 2),
                ai_generated_insights TEXT,
                predicted_time_window VARCHAR(100),
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('✅ AI_Risk_Assessment table created');

        await pool.query(`
            CREATE TABLE IF NOT EXISTS Alerts (
                id SERIAL PRIMARY KEY,
                student_id INTEGER REFERENCES Students(id) ON DELETE CASCADE,
                alert_type VARCHAR(50),
                severity VARCHAR(50),
                message TEXT,
                sent_to TEXT,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('✅ Alerts table created');

        await pool.query(`
            CREATE TABLE IF NOT EXISTS CommunityReports (
                id SERIAL PRIMARY KEY,
                user_id VARCHAR(100),
                report_type VARCHAR(50),
                message TEXT,
                sentiment_score DECIMAL(5, 2),
                ai_confidence DECIMAL(5, 2),
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('✅ CommunityReports table created (Anonymous Chatbots)');

        console.log('🎉 All Student Health tables initialized successfully.');
        process.exit(0);

    } catch (err) {
        console.error('❌ Error initializing database', err);
        process.exit(1);
    }
};

initDb();
