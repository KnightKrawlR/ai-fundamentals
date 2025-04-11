# AI Fundamentals Website Deployment Guide

This guide provides step-by-step instructions for deploying the updated AI Fundamentals website to your domain.

## What's Been Updated

1. **Fixed Header**: The header now stays fixed at the top of the page as you scroll, making navigation easier from anywhere on the site.

2. **Simplified Navigation**: All pages now show only three navigation items (Learning, AI Tools, Premium) as requested.

3. **Learning Pathways Updates**: 
   - Office Productivity is now inaccessible (similar to Personal Finance)
   - All learning paths have virtual course links that point to the coming-soon page
   - All inaccessible paths still link to the coming-soon page

4. **Premium Tier Discounts**: 
   - Added 10% discount on learning courses to the Premium tier
   - Added 15% discount on learning courses to the Lifetime tier

## Deployment Options

### Option 1: Using Bolt.new (Recommended)

1. **Upload the ZIP file**:
   - Go to [Bolt.new](https://bolt.new)
   - Create a new project or open your existing AI Fundamentals project
   - Click on "Upload" and select the `ai_fundamentals_updated.zip` file

2. **Deploy to your domain**:
   - In Bolt.new, go to "Settings" > "Domain"
   - Enter your domain name and follow the instructions to set up DNS records
   - Click "Deploy to Production"

### Option 2: Manual Deployment

1. **Extract the files**:
   - Extract the contents of `ai_fundamentals_updated.zip` to your local computer

2. **Upload via FTP**:
   - Connect to your web hosting using an FTP client (like FileZilla)
   - Upload all the extracted files to your web server's public directory (usually `public_html` or `www`)
   - Maintain the folder structure exactly as it is in the ZIP file

3. **Configure your domain**:
   - Ensure your domain is pointing to your web hosting server
   - If you're using a subdomain, make sure it's properly configured in your DNS settings

## Testing Your Deployment

After deploying, verify that all features are working correctly:

1. **Check the fixed header**: Scroll down on any page and confirm the header stays at the top
2. **Verify navigation**: Ensure all pages show only the three navigation items
3. **Test learning paths**: Confirm that Office Productivity is inaccessible and all paths have virtual course links
4. **Verify premium tiers**: Check that the discount information appears correctly in the premium tier descriptions

## Updating in the Future

When you need to make updates in the future:

1. **Request changes**: Reach out to me with your specific requirements
2. **Receive updated files**: I'll provide you with just the specific files that need to be updated
3. **Deploy updates**: Replace only the modified files using the same deployment method

This modular approach makes it easy to maintain and update your site without disrupting the entire implementation.

## Troubleshooting

If you encounter any issues during deployment:

1. **Check file permissions**: Ensure all files have the correct read permissions (typically 644 for files and 755 for directories)
2. **Clear browser cache**: Use Ctrl+F5 (Windows) or Cmd+Shift+R (Mac) to perform a hard refresh
3. **Verify all files were uploaded**: Compare the file structure on your server with the extracted ZIP contents
4. **Check for JavaScript errors**: Use your browser's developer tools (F12) to look for any console errors

## Need Help?

If you need assistance with the deployment process, please don't hesitate to reach out. I'm here to help ensure your AI Fundamentals website is up and running smoothly.
