module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		uglify: {
		  options: {
			banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
		  },
		  build: {
			src: 'src/<%= pkg.name %>.js',
			dest: 'build/<%= pkg.name %>.min.js'
		  }
		 },
		 protractor: {
			options: {
				keepAlive: true,
				singleRun: false,
				configFile: 'conf.js'
			},
			run_chrome: {
				options: {
					args: {
						seleniumAddress: 'http://localhost:4444/wd/hub',
						browser: 'chrome'
					}
				}
			},
			run_firefox1: {
				options: {
					args: {
						seleniumAddress: 'http://localhost:4441/wd/hub',
						browser: 'firefox'
					}
				}
			},
			run_firefox2: {
				options: {
					args: {
						seleniumAddress: 'http://localhost:4442/wd/hub',
						browser: 'firefox'
					}
				}
			}

		 },
	
		 execute: {
			 run_TA0001: {
				 src: ['QA_LOAD/TC0001_nodejs.js']
			 },
			 run_TA0002: {
				 src: ['QA_LOAD/TC0002_nodejs.js']
			 },
			 run_TA0003: {
				 src: ['QA_LOAD/TC0003_nodejs.js']
			 },
			 run_TA0004: {
				 src: ['QA_LOAD/TC0004_nodejs.js']
			 },
			 run_TA0005: {
				 src: ['QA_LOAD/TC0005_nodejs.js']
			 }
/*
			 run_TA0006: {
				 src: ['QA_LOAD/TC0006_nodejs.js']
			 },
			 run_TA0007: {
				 src: ['QA_LOAD/TC0007_nodejs.js']
			 },
			 run_TA0008: {
				 src: ['QA_LOAD/TC0008_nodejs.js']
			 },
			 run_TA0009: {
				 src: ['QA_LOAD/TC0009_nodejs.js']
			 },
			 run_TA0000: {
				 src: ['QA_LOAD/TC0000_nodejs.js']
			 }
*/
		 },
/*
		 shell: {                                // IVR load test shell setup
				run_TA0001: {                      // Target
		            options: {                      // Options
		                stdout: true
		            },
					command: 'ivr-gui-load1.bat'
				},
				run_TA0002: {                      // Target
		            options: {                      // Options
		                stdout: true
		            },
					command: 'ivr-gui-load2.bat'
				},
				run_TA0003: {                      // Target
		            options: {                      // Options
		                stdout: true
		            },
					command: 'ivr-gui-load3.bat'
				},
				run_TA0004: {                      // Target
		            options: {                      // Options
		                stdout: true
		            },
					command: 'ivr-gui-load4.bat'
				},
				run_TA0005: {                      // Target
		            options: {                      // Options
		                stdout: true
		            },
					command: 'ivr-gui-load5.bat'
				},
				run_TA0006: {                      // Target
		            options: {                      // Options
		                stdout: true
		            },
					command: 'ivr-gui-load6.bat'
				},
				run_TA0007: {                      // Target
		            options: {                      // Options
		                stdout: true
		            },
					command: 'ivr-gui-load7.bat'
				},
				run_TA0008: {                      // Target
		            options: {                      // Options
		                stdout: true
		            },
					command: 'ivr-gui-load8.bat'
				},
				run_TA0009: {                      // Target
		            options: {                      // Options
		                stdout: true
		            },
					command: 'ivr-gui-load9.bat'
				},
				run_TA0000: {                      // Target
		            options: {                      // Options
		                stdout: true
		            },
					command: 'ivr-gui-load0.bat'
				}

		 },
*/
/*		 shell: {                                // web api load test shell setup
				run_TA0001: {                      // Target
		            options: {                      // Options
		                stdout: true
		            },
					command: 'web-gui-load1.bat'
				},
				run_TA0002: {                      // Target
		            options: {                      // Options
		                stdout: true
		            },
					command: 'web-gui-load2.bat'
				},
				run_TA0003: {                      // Target
		            options: {                      // Options
		                stdout: true
		            },
					command: 'web-gui-load3.bat'
				},
				run_TA0004: {                      // Target
		            options: {                      // Options
		                stdout: true
		            },
					command: 'web-gui-load4.bat'
				},
				run_TA0005: {                      // Target
		            options: {                      // Options
		                stdout: true
		            },
					command: 'web-gui-load5.bat'
				},
				run_TA0006: {                      // Target
		            options: {                      // Options
		                stdout: true
		            },
					command: 'web-gui-load6.bat'
				},
				run_TA0007: {                      // Target
		            options: {                      // Options
		                stdout: true
		            },
					command: 'web-gui-load7.bat'
				},
				run_TA0008: {                      // Target
		            options: {                      // Options
		                stdout: true
		            },
					command: 'web-gui-load8.bat'
				},
				run_TA0009: {                      // Target
		            options: {                      // Options
		                stdout: true
		            },
					command: 'web-gui-load9.bat'
				},
				run_TA0000: {                      // Target
		            options: {                      // Options
		                stdout: true
		            },
					command: 'web-gui-load0.bat'
				}

		 },
*/

		 shell: {                                //  api load test shell setup (note: for which api used in test assigned in each batch file) 
				run_TA0001: {                      // Target
		            options: {                      // Options
		                stdout: true
		            },
					command: 'api-gui-load1.bat'
				},
				run_TA0002: {                      // Target
		            options: {                      // Options
		                stdout: true
		            },
					command: 'api-gui-load2.bat'
				},
				run_TA0003: {                      // Target
		            options: {                      // Options
		                stdout: true
		            },
					command: 'api-gui-load3.bat'
				},
				run_TA0004: {                      // Target
		            options: {                      // Options
		                stdout: true
		            },
					command: 'api-gui-load4.bat'
				},
				run_TA0005: {                      // Target
		            options: {                      // Options
		                stdout: true
		            },
					command: 'api-gui-load5.bat'
				},
				run_TA0006: {                      // Target
		            options: {                      // Options
		                stdout: true
		            },
					command: 'api-gui-load6.bat'
				},
				run_TA0007: {                      // Target
		            options: {                      // Options
		                stdout: true
		            },
					command: 'api-gui-load7.bat'
				},
				run_TA0008: {                      // Target
		            options: {                      // Options
		                stdout: true
		            },
					command: 'api-gui-load8.bat'
				},
				run_TA0009: {                      // Target
		            options: {                      // Options
		                stdout: true
		            },
					command: 'api-gui-load9.bat'
				},
				run_TA0000: {                      // Target
		            options: {                      // Options
		                stdout: true
		            },
					command: 'api-gui-load0.bat'
				}

		 },

		 concurrent: {
			protractor_test: ['protractor-chrome', 'protractor-firefox1', 'protractor-firefox2'],
//			load_test: ['loadtest-TA0001', 'loadtest-TA0002', 'loadtest-TA0003', 'loadtest-TA0004', 'loadtest-TA0005'],		//run 5 agents/channels test
//			load_test: ['loadtest-TA0001', 'loadtest-TA0002', 'loadtest-TA0003', 'loadtest-TA0004', 'loadtest-TA0006', 'loadtest-TA0007', 'loadtest-TA0008', 'loadtest-TA0009'], //run 8 agents/channel test
			load_test: ['loadtest-TA0001', 'loadtest-TA0002', 'loadtest-TA0003', 'loadtest-TA0004', 'loadtest-TA0005', 'loadtest-TA0006', 'loadtest-TA0007', 'loadtest-TA0008', 'loadtest-TA0009'], //run 9 agents/channel test
//			load_test: ['loadtest-TA0001', 'loadtest-TA0002', 'loadtest-TA0003', 'loadtest-TA0004', 'loadtest-TA0005','loadtest-TA0006', 'loadtest-TA0007', 'loadtest-TA0008', 'loadtest-TA0009', 'loadtest-TA0000'], //run 10 agents/channels test
            options:{
				 logConcurrentOutput: false,
		         limit: 11
			   //  limit: 6
			 }
		 }
	});

  // Load the plugin for tasks
//  grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-protractor-runner');
	grunt.loadNpmTasks('grunt-concurrent');
	grunt.loadNpmTasks('grunt-execute');
	grunt.loadNpmTasks('grunt-shell');

  // Default task(s)
//  grunt.registerTask('default', ['uglify']);

//   grunt.registerTask('default', 'Log some stuff', function() {
//	    grunt.log.write('Logging some stuff...').ok();
//   });
	grunt.registerTask('protractor-chrome', ['protractor:run_chrome']);
	grunt.registerTask('protractor-firefox1', ['protractor:run_firefox1']);
	grunt.registerTask('protractor-firefox2', ['protractor:run_firefox2']);

	grunt.registerTask('loadtest-TA0001', ['shell:run_TA0001']);
	grunt.registerTask('loadtest-TA0002', ['shell:run_TA0002']);
	grunt.registerTask('loadtest-TA0003', ['shell:run_TA0003']);
	grunt.registerTask('loadtest-TA0004', ['shell:run_TA0004']);
	grunt.registerTask('loadtest-TA0005', ['shell:run_TA0005']);
	grunt.registerTask('loadtest-TA0006', ['shell:run_TA0006']);
	grunt.registerTask('loadtest-TA0007', ['shell:run_TA0007']);
	grunt.registerTask('loadtest-TA0008', ['shell:run_TA0008']);
	grunt.registerTask('loadtest-TA0009', ['shell:run_TA0009']);
	grunt.registerTask('loadtest-TA0000', ['shell:run_TA0000']);

/*
	grunt.registerTask('loadtest-TA0001', ['execute:run_TA0001']);
	grunt.registerTask('loadtest-TA0002', ['execute:run_TA0002']);
	grunt.registerTask('loadtest-TA0003', ['execute:run_TA0003']);
	grunt.registerTask('loadtest-TA0004', ['execute:run_TA0004']);
	grunt.registerTask('loadtest-TA0005', ['execute:run_TA0005']);
*/
//	grunt.registerTask('loadtest-TA0006', ['execute:run_TA0006']);
//	grunt.registerTask('loadtest-TA0007', ['execute:run_TA0007']);
//	grunt.registerTask('loadtest-TA0008', ['execute:run_TA0008']);
//	grunt.registerTask('loadtest-TA0009', ['execute:run_TA0009']);
//	grunt.registerTask('loadtest-TA0000', ['execute:run_TA0000']);

/*
	grunt.registerTask('loadtest-TA0001', 'loadtest-TA0001', function() {
	  grunt.util.spawn({
		cmd: 'node',
		args: ['QA_LOAD/TC0001_nodejs.js']
	  });
	  //grunt.task.run('watch');
	});
	grunt.registerTask('loadtest-TA0002', 'loadtest-TA0002', function() {
	  grunt.util.spawn({
		cmd: 'node',
		args: ['QA_LOAD/TC0002_nodejs.js']
	  });
	//  grunt.task.run('watch');
	});
	grunt.registerTask('loadtest-TA0003', 'loadtest-TA0003', function() {
	  grunt.util.spawn({
		cmd: 'node',
		args: ['QA_LOAD/TC0003_nodejs.js']
	  });
	  //grunt.task.run('watch');
	});

*/
	grunt.registerTask('protractor-e2e', ['concurrent:protractor_test']);
	grunt.registerTask('loadtest-node', ['concurrent:load_test']);

};