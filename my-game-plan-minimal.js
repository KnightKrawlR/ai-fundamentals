// Enhanced game plan component with three-dropdown structure
(function() {
  // Verify React and ReactDOM are available
  if (typeof React === 'undefined' || typeof ReactDOM === 'undefined') {
    console.error('React or ReactDOM is not available!');
    return;
  }

  // Game Plan Component with three-dropdown structure
  function MyGamePlan() {
    // State hooks
    const [selectedTopic, setSelectedTopic] = React.useState('');
    const [selectedChallenge, setSelectedChallenge] = React.useState('');
    const [selectedProjectType, setSelectedProjectType] = React.useState('');
    const [projectDescription, setProjectDescription] = React.useState('');
    const [isGenerating, setIsGenerating] = React.useState(false);
    const [generatedPlan, setGeneratedPlan] = React.useState(null);
    const [credits, setCredits] = React.useState(10);
    const [showCreditModal, setShowCreditModal] = React.useState(false);

    // Topics
    const topics = [
      'Introduction to AI',
      'Office Productivity',
      'Personal Finance',
      'Social Media Marketing',
      'Videography',
      'eCommerce'
    ];

    // Challenges based on selected topic
    const getChallenges = (topic) => {
      switch(topic) {
        case 'Introduction to AI':
          return [
            'Understanding AI Concepts',
            'Implementing Machine Learning',
            'Natural Language Processing',
            'Computer Vision',
            'AI Ethics and Bias'
          ];
        case 'Office Productivity':
          return [
            'Document Automation',
            'Email Management',
            'Meeting Optimization',
            'Task Prioritization',
            'Workflow Automation'
          ];
        case 'Personal Finance':
          return [
            'Budgeting',
            'Investment Planning',
            'Debt Management',
            'Retirement Planning',
            'Tax Optimization'
          ];
        case 'Social Media Marketing':
          return [
            'Content Creation',
            'Audience Growth',
            'Analytics and Insights',
            'Campaign Management',
            'Influencer Collaboration'
          ];
        case 'Videography':
          return [
            'Video Editing',
            'Camera Techniques',
            'Lighting Setup',
            'Audio Recording',
            'Post-Production Effects'
          ];
        case 'eCommerce':
          return [
            'Store Setup',
            'Product Management',
            'Payment Processing',
            'Customer Experience',
            'Marketing Automation'
          ];
        default:
          return [];
      }
    };

    // Project types based on selected topic and challenge
    const getProjectTypes = (topic, challenge) => {
      if (!topic || !challenge) return [];
      
      // Common project types across all topics
      const commonTypes = ['Personal Project', 'Small Business', 'Enterprise Solution'];
      
      // Add specific project types based on topic
      switch(topic) {
        case 'Introduction to AI':
          return [...commonTypes, 'Research Project', 'Educational Tool'];
        case 'Office Productivity':
          return [...commonTypes, 'Team Workflow', 'Department Process'];
        case 'Personal Finance':
          return [...commonTypes, 'Family Budget', 'Investment Portfolio'];
        case 'Social Media Marketing':
          return [...commonTypes, 'Brand Campaign', 'Influencer Program'];
        case 'Videography':
          return [...commonTypes, 'Short Film', 'Tutorial Series', 'Documentary'];
        case 'eCommerce':
          return [...commonTypes, 'Product Launch', 'Store Migration', 'Marketplace Integration'];
        default:
          return commonTypes;
      }
    };

    // Reset challenges when topic changes
    React.useEffect(() => {
      setSelectedChallenge('');
      setSelectedProjectType('');
    }, [selectedTopic]);

    // Reset project type when challenge changes
    React.useEffect(() => {
      setSelectedProjectType('');
    }, [selectedChallenge]);

    // Simulated plan generation
    const generatePlan = () => {
      if ((!selectedTopic && !projectDescription) || credits < 5) {
        return;
      }

      setIsGenerating(true);
      
      // Simulate API call delay
      setTimeout(() => {
        let topicSteps = [];
        let topicTechnologies = [];
        
        // Generate different content based on selected topic
        switch(selectedTopic) {
          case 'Introduction to AI':
            topicSteps = [
              "Install Python and necessary ML libraries (TensorFlow, PyTorch, or scikit-learn)",
              "Set up a development environment with Jupyter Notebook",
              "Gather and preprocess training data",
              "Build a basic AI model for your specific use case",
              "Train and evaluate your model",
              "Deploy your model to a web service for integration"
            ];
            topicTechnologies = [
              { name: "Python", description: "Primary programming language for AI development" },
              { name: "TensorFlow/PyTorch", description: "Deep learning frameworks" },
              { name: "Jupyter Notebook", description: "Interactive environment for ML development" },
              { name: "Flask/FastAPI", description: "Web frameworks for deploying AI models" }
            ];
            break;
          case 'Office Productivity':
            topicSteps = [
              "Analyze current workflow and identify bottlenecks",
              "Select appropriate automation tools (Microsoft Power Automate, Zapier, etc.)",
              "Design automated workflow with clear triggers and actions",
              "Implement initial automation for testing",
              "Gather user feedback and iterate on solution",
              "Deploy across team/organization with training"
            ];
            topicTechnologies = [
              { name: "Microsoft Power Automate", description: "Workflow automation platform" },
              { name: "Zapier", description: "Integration platform for connecting apps" },
              { name: "Google Workspace", description: "Cloud-based productivity and collaboration tools" },
              { name: "Notion", description: "All-in-one workspace for notes, tasks, and databases" }
            ];
            break;
          case 'eCommerce':
            topicSteps = [
              "Define your product catalog and business model",
              "Select an e-commerce platform (Shopify, WooCommerce, etc.)",
              "Set up payment processing and shipping methods",
              "Design and customize your online store",
              "Set up inventory management and order fulfillment",
              "Implement marketing and analytics tools"
            ];
            topicTechnologies = [
              { name: "Shopify", description: "E-commerce platform for online stores" },
              { name: "WooCommerce", description: "WordPress e-commerce plugin" },
              { name: "Stripe/PayPal", description: "Payment processing solutions" },
              { name: "Google Analytics", description: "Web analytics service for tracking traffic" }
            ];
            break;
          default:
            topicSteps = [
              "Define project scope and requirements",
              "Research and select appropriate technologies",
              "Set up development environment",
              "Implement core functionality",
              "Test thoroughly across different use cases",
              "Deploy and gather user feedback"
            ];
            topicTechnologies = [
              { name: "React", description: "Frontend library for building user interfaces" },
              { name: "Node.js", description: "JavaScript runtime for backend development" },
              { name: "Firebase", description: "Platform for app development with backend services" },
              { name: "GitHub", description: "Version control and project management" }
            ];
        }
        
        // Create learning resources
        const resources = [
          {
            title: `${selectedTopic || 'Project'} Fundamentals Course`,
            url: "https://ai-fundamentals.me/learning.html",
            type: "Course"
          },
          {
            title: `${selectedChallenge || 'Development'} Best Practices`,
            url: "https://ai-fundamentals.me/learning.html",
            type: "Guide"
          },
          {
            title: `Building ${selectedProjectType || 'Projects'} Tutorial`,
            url: "https://ai-fundamentals.me/tutorials.html",
            type: "Tutorial"
          }
        ];
        
        // Generate plan
        setGeneratedPlan({
          description: projectDescription || `${selectedTopic} - ${selectedChallenge || 'General'}`,
          topic: selectedTopic,
          challenge: selectedChallenge,
          projectType: selectedProjectType,
          plan: topicSteps,
          technologies: topicTechnologies,
          resources: resources,
          createdAt: new Date()
        });
        
        setIsGenerating(false);
        // Deduct credits for plan generation
        setCredits(prevCredits => prevCredits - 5);
      }, 2000);
    };

    // Reset form and return to input
    const createNewPlan = () => {
      setGeneratedPlan(null);
      setSelectedTopic('');
      setSelectedChallenge('');
      setSelectedProjectType('');
      setProjectDescription('');
    };

    // Simulated credit purchase
    const purchaseCredits = (amount) => {
      setCredits(prevCredits => prevCredits + amount);
      setShowCreditModal(false);
    };

    // Render credit purchase modal
    const renderCreditModal = () => {
      return React.createElement('div', {
        style: {
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }
      }, [
        React.createElement('div', {
          style: {
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '8px',
            maxWidth: '400px',
            width: '100%'
          }
        }, [
          React.createElement('h2', {
            style: { marginBottom: '16px', fontSize: '20px' }
          }, 'Purchase Credits'),
          React.createElement('p', {
            style: { marginBottom: '16px' }
          }, 'Select a credit package to continue using AI Game Plan generation.'),
          React.createElement('div', {
            style: { display: 'grid', gap: '12px', marginBottom: '16px' }
          }, [
            React.createElement('button', {
              onClick: () => purchaseCredits(5),
              style: {
                padding: '12px',
                border: '1px solid #e2e8f0',
                borderRadius: '4px',
                cursor: 'pointer'
              }
            }, [
              React.createElement('div', { style: { fontWeight: 'bold' } }, '5 Credits'),
              React.createElement('div', { style: { fontSize: '14px', color: '#718096' } }, '$4.99')
            ]),
            React.createElement('button', {
              onClick: () => purchaseCredits(20),
              style: {
                padding: '12px',
                border: '1px solid #e2e8f0',
                borderRadius: '4px',
                cursor: 'pointer'
              }
            }, [
              React.createElement('div', { style: { fontWeight: 'bold' } }, '20 Credits'),
              React.createElement('div', { style: { fontSize: '14px', color: '#718096' } }, '$14.99')
            ]),
            React.createElement('button', {
              onClick: () => purchaseCredits(50),
              style: {
                padding: '12px',
                border: '1px solid #e2e8f0',
                borderRadius: '4px',
                cursor: 'pointer'
              }
            }, [
              React.createElement('div', { style: { fontWeight: 'bold' } }, '50 Credits'),
              React.createElement('div', { style: { fontSize: '14px', color: '#718096' } }, '$29.99')
            ])
          ]),
          React.createElement('div', {
            style: { display: 'flex', justifyContent: 'flex-end' }
          }, [
            React.createElement('button', {
              onClick: () => setShowCreditModal(false),
              style: {
                padding: '8px 16px',
                color: '#718096',
                background: 'none',
                border: 'none',
                cursor: 'pointer'
              }
            }, 'Cancel')
          ])
        ])
      ]);
    };

    // If showing the plan, render that
    if (generatedPlan) {
      return React.createElement('div', {
        style: {
          backgroundColor: 'white',
          borderRadius: '8px',
          padding: '20px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          maxWidth: '800px',
          margin: '0 auto'
        }
      }, [
        // Header with close button
        React.createElement('div', {
          style: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: '16px'
          }
        }, [
          React.createElement('h2', {
            style: { fontSize: '24px', fontWeight: '600' }
          }, generatedPlan.description || 'Game Plan'),
          React.createElement('button', {
            onClick: createNewPlan,
            style: {
              background: 'none',
              border: 'none',
              color: '#718096',
              cursor: 'pointer',
              fontSize: '20px'
            }
          }, '×')
        ]),
        
        // Tags
        React.createElement('div', {
          style: {
            display: 'flex',
            flexWrap: 'wrap',
            gap: '8px',
            marginBottom: '16px'
          }
        }, [
          generatedPlan.topic && React.createElement('span', {
            style: {
              padding: '4px 8px',
              backgroundColor: '#e0f2fe',
              color: '#0369a1',
              borderRadius: '4px',
              fontSize: '14px',
              fontWeight: '500'
            }
          }, generatedPlan.topic),
          generatedPlan.challenge && React.createElement('span', {
            style: {
              padding: '4px 8px',
              backgroundColor: '#dcfce7',
              color: '#15803d',
              borderRadius: '4px',
              fontSize: '14px',
              fontWeight: '500'
            }
          }, generatedPlan.challenge),
          generatedPlan.projectType && React.createElement('span', {
            style: {
              padding: '4px 8px',
              backgroundColor: '#f3e8ff',
              color: '#7e22ce',
              borderRadius: '4px',
              fontSize: '14px',
              fontWeight: '500'
            }
          }, generatedPlan.projectType)
        ]),
        
        // Implementation Plan
        React.createElement('div', {
          style: { marginBottom: '24px' }
        }, [
          React.createElement('h3', {
            style: { fontSize: '18px', fontWeight: '500', marginBottom: '8px' }
          }, 'Implementation Plan'),
          React.createElement('div', {
            style: {
              backgroundColor: '#f8fafc',
              padding: '16px',
              borderRadius: '8px'
            }
          }, generatedPlan.plan.map((step, index) => 
            React.createElement('div', {
              key: index,
              style: { marginBottom: '12px' }
            }, [
              React.createElement('div', {
                style: { fontWeight: '500' }
              }, `Step ${index + 1}`),
              React.createElement('div', {}, step)
            ])
          ))
        ]),
        
        // Technologies
        React.createElement('div', {
          style: { marginBottom: '24px' }
        }, [
          React.createElement('h3', {
            style: { fontSize: '18px', fontWeight: '500', marginBottom: '8px' }
          }, 'Recommended Technologies'),
          React.createElement('div', {
            style: {
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
              gap: '12px'
            }
          }, generatedPlan.technologies.map((tech, index) => 
            React.createElement('div', {
              key: index,
              style: {
                backgroundColor: '#eef7ff',
                padding: '12px',
                borderRadius: '8px'
              }
            }, [
              React.createElement('div', {
                style: { fontWeight: '500', marginBottom: '4px' }
              }, tech.name),
              React.createElement('div', {
                style: { fontSize: '14px' }
              }, tech.description)
            ])
          ))
        ]),
        
        // Resources
        React.createElement('div', {}, [
          React.createElement('h3', {
            style: { fontSize: '18px', fontWeight: '500', marginBottom: '8px' }
          }, 'Learning Resources'),
          React.createElement('ul', {
            style: {
              listStyleType: 'disc',
              paddingLeft: '20px'
            }
          }, generatedPlan.resources.map((resource, index) => 
            React.createElement('li', {
              key: index,
              style: { marginBottom: '8px' }
            }, [
              React.createElement('a', {
                href: resource.url,
                target: '_blank',
                rel: 'noopener noreferrer',
                style: {
                  color: '#0284c7',
                  textDecoration: 'none'
                }
              }, resource.title),
              React.createElement('span', {
                style: {
                  fontSize: '14px',
                  color: '#718096',
                  marginLeft: '8px'
                }
              }, `- ${resource.type}`)
            ])
          ))
        ])
      ]);
    }

    // Render form input
    return React.createElement('div', {
      style: {
        maxWidth: '800px',
        margin: '0 auto',
        padding: '20px'
      }
    }, [
      // Credits display
      React.createElement('div', {
        style: {
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '24px'
        }
      }, [
        React.createElement('span', {
          style: {
            fontSize: '14px',
            color: credits < 5 ? '#e53e3e' : '#718096',
            fontWeight: credits < 5 ? 'bold' : 'normal'
          }
        }, `Credits: ${credits}`),
        credits < 5 && React.createElement('button', {
          onClick: () => setShowCreditModal(true),
          style: {
            fontSize: '12px',
            padding: '4px 8px',
            backgroundColor: '#0ea5e9',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }
        }, 'Add Credits')
      ]),
      
      // Input form container
      React.createElement('div', {
        style: {
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          padding: '24px'
        }
      }, [
        React.createElement('h2', {
          style: {
            fontSize: '20px',
            fontWeight: '600',
            marginBottom: '16px'
          }
        }, 'Create New Game Plan'),
        
        // Three-dropdown structure
        React.createElement('div', {
          style: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '16px',
            marginBottom: '16px'
          }
        }, [
          // Topic dropdown
          React.createElement('div', {}, [
            React.createElement('label', {
              htmlFor: 'topic',
              style: {
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                marginBottom: '8px'
              }
            }, 'Topic'),
            React.createElement('select', {
              id: 'topic',
              value: selectedTopic,
              onChange: (e) => setSelectedTopic(e.target.value),
              disabled: isGenerating,
              style: {
                width: '100%',
                padding: '8px',
                border: '1px solid #e2e8f0',
                borderRadius: '4px'
              }
            }, [
              React.createElement('option', { value: '' }, 'Select a topic'),
              ...topics.map(topic => 
                React.createElement('option', { key: topic, value: topic }, topic)
              )
            ])
          ]),
          
          // Challenge dropdown
          React.createElement('div', {}, [
            React.createElement('label', {
              htmlFor: 'challenge',
              style: {
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                marginBottom: '8px'
              }
            }, 'Common Challenge'),
            React.createElement('select', {
              id: 'challenge',
              value: selectedChallenge,
              onChange: (e) => setSelectedChallenge(e.target.value),
              disabled: !selectedTopic || isGenerating,
              style: {
                width: '100%',
                padding: '8px',
                border: '1px solid #e2e8f0',
                borderRadius: '4px'
              }
            }, [
              React.createElement('option', { value: '' }, 'Select a challenge'),
              ...getChallenges(selectedTopic).map(challenge => 
                React.createElement('option', { key: challenge, value: challenge }, challenge)
              )
            ])
          ]),
          
          // Project Type dropdown
          React.createElement('div', {}, [
            React.createElement('label', {
              htmlFor: 'projectType',
              style: {
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                marginBottom: '8px'
              }
            }, 'Project Type'),
            React.createElement('select', {
              id: 'projectType',
              value: selectedProjectType,
              onChange: (e) => setSelectedProjectType(e.target.value),
              disabled: !selectedChallenge || isGenerating,
              style: {
                width: '100%',
                padding: '8px',
                border: '1px solid #e2e8f0',
                borderRadius: '4px'
              }
            }, [
              React.createElement('option', { value: '' }, 'Select a project type'),
              ...getProjectTypes(selectedTopic, selectedChallenge).map(type => 
                React.createElement('option', { key: type, value: type }, type)
              )
            ])
          ])
        ]),
        
        // Description textarea
        React.createElement('div', {
          style: { marginBottom: '16px' }
        }, [
          React.createElement('label', {
            htmlFor: 'description',
            style: {
              display: 'block',
              fontSize: '14px',
              fontWeight: '500',
              marginBottom: '8px'
            }
          }, 'Additional Project Details (Optional)'),
          React.createElement('textarea', {
            id: 'description',
            value: projectDescription,
            onChange: (e) => setProjectDescription(e.target.value),
            disabled: isGenerating,
            placeholder: "Add any specific details about your project that aren't covered by the selections above",
            style: {
              width: '100%',
              padding: '12px',
              border: '1px solid #e2e8f0',
              borderRadius: '4px',
              minHeight: '100px',
              resize: 'vertical'
            }
          })
        ]),
        
        // Generate button
        React.createElement('button', {
          onClick: generatePlan,
          disabled: isGenerating || (!projectDescription.trim() && !selectedTopic) || credits < 5,
          style: {
            backgroundColor: '#0ea5e9',
            color: 'white',
            border: 'none',
            padding: '12px',
            borderRadius: '4px',
            width: '100%',
            fontWeight: '500',
            cursor: (!projectDescription.trim() && !selectedTopic) || isGenerating || credits < 5 ? 'not-allowed' : 'pointer',
            opacity: (!projectDescription.trim() && !selectedTopic) || isGenerating || credits < 5 ? 0.5 : 1
          }
        }, isGenerating ? 'Generating Plan...' : 'Create Game Plan')
      ]),

      // Show credit purchase modal if needed
      showCreditModal && renderCreditModal()
    ]);
  }

  // Wait for DOM to be ready
  document.addEventListener('DOMContentLoaded', function() {
    const rootElement = document.getElementById('my-game-plan-root');
    
    if (rootElement) {
      console.log('Rendering MyGamePlan component to:', rootElement);
      
      // Hide the loading indicator
      const loadingEl = document.getElementById('loading-fallback');
      if (loadingEl) loadingEl.style.display = 'none';
      
      // Render our component
      ReactDOM.render(
        React.createElement(MyGamePlan, null),
        rootElement
      );
      
      console.log('MyGamePlan component rendered successfully!');
    } else {
      console.error('Root element not found!');
    }
  });
})(); 