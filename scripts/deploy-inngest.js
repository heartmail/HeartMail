#!/usr/bin/env node

/**
 * Deploy Inngest Functions to Production
 * This script deploys the Inngest functions to the production environment
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const config = require('../inngest.config.js');

async function deployInngest() {
  console.log('🚀 Deploying Inngest Functions to Production...\n');

  try {
    // Check if we're in production environment
    if (process.env.NODE_ENV !== 'production') {
      console.log('⚠️  Warning: Not in production environment');
      console.log('   Set NODE_ENV=production to deploy to production');
    }

    // Check required environment variables
    const requiredEnvVars = [
      'INNGEST_SIGNING_KEY',
      'INNGEST_EVENT_KEY',
      'NEXT_PUBLIC_APP_URL'
    ];

    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
    if (missingVars.length > 0) {
      console.error('❌ Missing required environment variables:');
      missingVars.forEach(varName => console.error(`   - ${varName}`));
      process.exit(1);
    }

    console.log('✅ Environment variables validated');

    // Deploy functions using Inngest CLI
    console.log('\n📦 Deploying functions...');
    
    const deployCommand = `npx inngest-cli@latest deploy --url=${config.prod.url} --signing-key=${process.env.INNGEST_SIGNING_KEY}`;
    
    console.log(`Running: ${deployCommand.replace(process.env.INNGEST_SIGNING_KEY, '[REDACTED]')}`);
    
    try {
      execSync(deployCommand, { 
        stdio: 'inherit',
        cwd: path.join(__dirname, '..')
      });
      
      console.log('✅ Functions deployed successfully!');
      
    } catch (error) {
      console.error('❌ Deployment failed:', error.message);
      process.exit(1);
    }

    // Verify deployment
    console.log('\n🔍 Verifying deployment...');
    
    const verifyCommand = `npx inngest-cli@latest functions list --url=${config.prod.url}`;
    
    try {
      execSync(verifyCommand, { 
        stdio: 'inherit',
        cwd: path.join(__dirname, '..')
      });
      
      console.log('✅ Deployment verified!');
      
    } catch (error) {
      console.error('❌ Verification failed:', error.message);
      console.log('   Functions may still be deployed, but verification failed');
    }

    console.log('\n🎉 Inngest deployment complete!');
    console.log('\n📋 Next Steps:');
    console.log('1. Test scheduled email functionality');
    console.log('2. Monitor function executions in Inngest dashboard');
    console.log('3. Set up alerts for failed functions');
    console.log('4. Configure monitoring and logging');

  } catch (error) {
    console.error('❌ Deployment failed:', error.message);
    process.exit(1);
  }
}

// Run deployment
deployInngest();
