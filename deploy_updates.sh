#!/bin/bash

# Supabase Project ID
PROJECT_REF="xnjqsgdapbjnowzwhnaq"

# Check if secret is provided as an argument, otherwise prompt
if [ -z "$1" ]; then
    echo "Please enter the Google Client Secret:"
    read -s GOOGLE_CLIENT_SECRET
else
    GOOGLE_CLIENT_SECRET=$1
fi

if [ -z "$GOOGLE_CLIENT_SECRET" ]; then
    echo "Error: Google Client Secret is required."
    exit 1
fi

echo "Setting Google Client Secret..."
supabase secrets set GOOGLE_CLIENT_SECRET="$GOOGLE_CLIENT_SECRET" --project-ref "$PROJECT_REF"

echo "Deploying Edge Functions..."
# Deploying google-auth and stripe-auth functions

if [ -d "chalk-app/supabase" ]; then
    cd chalk-app
fi

if [ -d "supabase" ]; then
    supabase functions deploy google-auth --no-verify-jwt --project-ref "$PROJECT_REF"
    supabase functions deploy stripe-auth --no-verify-jwt --project-ref "$PROJECT_REF"
    echo "Deployment complete."
else
    echo "Error: 'supabase' directory not found. Please run this script from the project root."
    exit 1
fi
