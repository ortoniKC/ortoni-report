pipeline {
    agent any
    
    tools {
        nodejs 'node' // Ensure Node.js is installed
    }

    environment {
        CI = 'true'
    }

    stages {
        stage('Install Dependencies') {
            steps {
                sh 'npm install'
            }
        }

        stage('Run Playwright Tests') {
            steps {
                // We use '|| true' to ensure the pipeline continues to the Merge stage
                // even if tests fail. Ortoni Report's merge-report will signal the failure.
                sh 'npx playwright test --shard=1/2 || true'
                sh 'npx playwright test --shard=2/2 || true'
            }
        }

        stage('Merge Ortoni Reports') {
            steps {
                // This command will now exit with code 1 if any merged tests failed
                sh 'npx ortoni-report merge-report'
            }
        }
    }

    post {
        always {
            // Archive the Ortoni Report
            publishHTML(target: [
                allowMissing: false,
                alwaysLinkName: true,
                keepAll: true,
                reportDir: 'ortoni-report',
                reportFiles: 'ortoni-report.html',
                reportName: 'Ortoni Test Report'
            ])
            
            // Optional: Backup shard data
            archiveArtifacts artifacts: 'ortoni-report/*.json', allowEmptyArchive: true
        }
    }
}
