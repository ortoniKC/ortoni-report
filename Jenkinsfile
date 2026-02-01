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
            parallel {
                stage('Shard 1') {
                    steps { sh 'npx playwright test --shard=1/2 || true' }
                }
                stage('Shard 2') {
                    steps { sh 'npx playwright test --shard=2/2 || true' }
                }
            }
        }

        stage('Merge & Publish Report') {
            steps {
                // Merge the sharded reports into a single Ortoni Report.
                sh 'npx ortoni-report merge-report'
                
                // Publish the HTML report to Jenkins.
                publishHTML(target: [
                    allowMissing: false,
                    alwaysLinkName: true,
                    keepAll: true,
                    reportDir: 'ortoni-report',
                    reportFiles: 'ortoni-report.html',
                    reportName: 'Ortoni Test Report'
                ])
                
                // To prevent the stage from being "always green" when tests fail,
                // you can either use a JUnit reporter alongside Ortoni:
                // sh 'npx playwright test --reporter=junit,ortoni-report'
                // junit 'results.xml'
                
                // OR manually fail the stage if you prefer not using JUnit:
                // script {
                //    if (some_condition_to_check_failures) {
                //        error("Test failures detected in Ortoni Report")
                //    }
                // }
            }
        }
    }

    post {
        always {
            // Optional: Archive shard data for debugging
            archiveArtifacts artifacts: 'ortoni-report/ortoni-report.html', allowEmptyArchive: true
        }
    }
}
