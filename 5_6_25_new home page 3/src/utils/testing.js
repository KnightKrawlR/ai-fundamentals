// This file contains browser testing configurations and utilities

const devices = [
  {
    name: 'Mobile (iPhone SE)',
    width: 375,
    height: 667,
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1',
    isMobile: true
  },
  {
    name: 'Mobile (iPhone 12)',
    width: 390,
    height: 844,
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1',
    isMobile: true
  },
  {
    name: 'Tablet (iPad)',
    width: 768,
    height: 1024,
    userAgent: 'Mozilla/5.0 (iPad; CPU OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1',
    isMobile: true
  },
  {
    name: 'Laptop',
    width: 1366,
    height: 768,
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    isMobile: false
  },
  {
    name: 'Desktop',
    width: 1920,
    height: 1080,
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    isMobile: false
  }
];

const browsers = [
  {
    name: 'Chrome',
    version: '91.0.4472.124'
  },
  {
    name: 'Firefox',
    version: '89.0'
  },
  {
    name: 'Safari',
    version: '14.1.1'
  },
  {
    name: 'Edge',
    version: '91.0.864.59'
  }
];

// Test cases for cross-browser and cross-device testing
const testCases = [
  {
    name: 'Homepage Rendering',
    description: 'Verify that the homepage renders correctly across all devices and browsers',
    steps: [
      'Load the homepage',
      'Verify that all sections are visible',
      'Verify that all images load correctly',
      'Verify that all text is readable'
    ]
  },
  {
    name: 'Navigation',
    description: 'Verify that navigation works correctly across all devices and browsers',
    steps: [
      'Click on all navigation links',
      'Verify that mobile menu opens and closes correctly on mobile devices',
      'Verify that dropdown menus work correctly'
    ]
  },
  {
    name: 'Hero Section',
    description: 'Verify that the hero section renders correctly across all devices and browsers',
    steps: [
      'Verify that the hero heading and subheading are visible',
      'Verify that the CTA buttons are visible and clickable',
      'Verify that the floating cards are visible and positioned correctly',
      'Verify that animations work correctly'
    ]
  },
  {
    name: 'Game Plan Feature Section',
    description: 'Verify that the Game Plan feature section renders correctly across all devices and browsers',
    steps: [
      'Verify that the section heading and description are visible',
      'Verify that the steps are visible and readable',
      'Verify that the visual representation is visible and positioned correctly',
      'Verify that the CTA button is visible and clickable'
    ]
  },
  {
    name: 'Game Plan Creator',
    description: 'Verify that the Game Plan Creator renders correctly across all devices and browsers',
    steps: [
      'Verify that all form fields are visible and usable',
      'Verify that dropdowns open and close correctly',
      'Verify that the Generate button is visible and clickable',
      'Verify that hover effects work correctly'
    ]
  },
  {
    name: 'Animations',
    description: 'Verify that animations work correctly across all devices and browsers',
    steps: [
      'Verify that scroll animations trigger at the right time',
      'Verify that hover animations work correctly',
      'Verify that transition animations work correctly',
      'Verify that particle background renders correctly'
    ]
  },
  {
    name: 'Responsive Design',
    description: 'Verify that the responsive design works correctly across all devices',
    steps: [
      'Verify that the layout adjusts correctly for different screen sizes',
      'Verify that text sizes adjust correctly for different screen sizes',
      'Verify that spacing adjusts correctly for different screen sizes',
      'Verify that images scale correctly for different screen sizes'
    ]
  },
  {
    name: 'Performance',
    description: 'Verify that the homepage performs well across all devices and browsers',
    steps: [
      'Measure page load time',
      'Measure time to interactive',
      'Measure frame rate during animations',
      'Verify that there are no console errors'
    ]
  }
];

// Test results template
const testResultsTemplate = {
  device: '',
  browser: '',
  testCase: '',
  result: '', // 'Pass', 'Fail', or 'Warning'
  notes: '',
  screenshot: '',
  date: ''
};

module.exports = {
  devices,
  browsers,
  testCases,
  testResultsTemplate
};
