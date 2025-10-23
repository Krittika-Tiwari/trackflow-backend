#!/bin/bash

# TrackFlow Backend - Module Generation Script
# This script generates all necessary modules using NestJS CLI

echo "🚀 Starting TrackFlow Backend Module Generation..."
echo ""

# Function to print step
print_step() {
    echo "📦 $1"
}

# ==================================
# STEP 1: Generate Core Modules
# ==================================
echo "=================================="
echo "STEP 1: Generating Core Modules"
echo "=================================="

print_step "Generating Users Module..."
nest g resource modules/users --no-spec
echo ""

print_step "Generating Auth Module..."
nest g module modules/auth
nest g controller modules/auth --no-spec
nest g service modules/auth --no-spec
echo ""

print_step "Generating Social Accounts Module..."
nest g resource modules/social-accounts --no-spec
echo ""

print_step "Generating Posts Module..."
nest g resource modules/posts --no-spec
echo ""

print_step "Generating Analytics Module..."
nest g module modules/analytics
nest g controller modules/analytics --no-spec
nest g service modules/analytics --no-spec
echo ""

print_step "Generating Scheduler Module..."
nest g resource modules/scheduler --no-spec
echo ""

# ==================================
# STEP 2: Generate Integration Modules
# ==================================
echo "=================================="
echo "STEP 2: Generating Integration Modules"
echo "=================================="

print_step "Generating Twitter Integration..."
nest g module modules/integrations/twitter
nest g service modules/integrations/twitter --no-spec
echo ""

print_step "Generating Instagram Integration..."
nest g module modules/integrations/instagram
nest g service modules/integrations/instagram --no-spec
echo ""

print_step "Generating LinkedIn Integration..."
nest g module modules/integrations/linkedin
nest g service modules/integrations/linkedin --no-spec
echo ""

print_step "Generating Facebook Integration..."
nest g module modules/integrations/facebook
nest g service modules/integrations/facebook --no-spec
echo ""

# ==================================
# STEP 3: Generate Common Components
# ==================================
echo "=================================="
echo "STEP 3: Generating Common Components"
echo "=================================="

print_step "Generating Guards..."
nest g guard common/guards/jwt-auth --no-spec
nest g guard common/guards/roles --no-spec
echo ""

print_step "Generating Interceptors..."
nest g interceptor common/interceptors/transform --no-spec
nest g interceptor common/interceptors/logging --no-spec
echo ""

print_step "Generating Filters..."
nest g filter common/filters/http-exception --no-spec
nest g filter common/filters/all-exceptions --no-spec
echo ""

print_step "Generating Pipes..."
nest g pipe common/pipes/validation --no-spec
echo ""

# ==================================
# STEP 4: Create Additional Directories
# ==================================
echo "=================================="
echo "STEP 4: Creating Additional Directories"
echo "=================================="

print_step "Creating additional directories..."
mkdir -p src/common/decorators
mkdir -p src/modules/auth/dto
mkdir -p src/modules/auth/guards
mkdir -p src/modules/auth/strategies
mkdir -p src/database/migrations
mkdir -p src/database/seeds
echo ""

# ==================================
# STEP 5: Create Manual Files
# ==================================
echo "=================================="
echo "STEP 5: Creating Manual Configuration Files"
echo "=================================="

print_step "Creating custom decorator files..."

# Create GetUser decorator
cat > src/common/decorators/get-user.decorator.ts << 'EOF'
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const GetUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
EOF

# Create Roles decorator
cat > src/common/decorators/roles.decorator.ts << 'EOF'
import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
EOF

# Create Public decorator
cat > src/common/decorators/public.decorator.ts << 'EOF'
import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
EOF

echo ""

# ==================================
# Summary
# ==================================
echo "=================================="
echo "✅ Module Generation Complete!"
echo "=================================="
echo ""
echo "📊 Generated Structure:"
echo "  ✓ Users Module (with CRUD)"
echo "  ✓ Auth Module"
echo "  ✓ Social Accounts Module (with CRUD)"
echo "  ✓ Posts Module (with CRUD)"
echo "  ✓ Analytics Module"
echo "  ✓ Scheduler Module (with CRUD)"
echo "  ✓ Integration Modules (Twitter, Instagram, LinkedIn, Facebook)"
echo "  ✓ Common Components (Guards, Interceptors, Filters, Pipes)"
echo "  ✓ Custom Decorators"
echo ""
echo "🔄 Next Steps:"
echo "  1. Create entities for each module"
echo "  2. Set up DTOs (Data Transfer Objects)"
echo "  3. Implement authentication with JWT"
echo "  4. Configure database migrations"
echo "  5. Implement business logic in services"
echo ""
echo "💡 To run the application:"
echo "  npm run start:dev"
echo ""
echo "🎉 Happy coding!"