#!/bin/sh
export JAVA_HOME=/usr/java/jre1.7.0_25
export CLASSPATH=$JAVA_HOME/jre/lib/ext:$JAVA_HOME/lib:$JAVA_HOME/jre/lib:$JAVA_HOME/jre/lib/amd64/server:/usr/src:/usr/src/test
export LD_LIBRARY_PATH=$LD_LIBRARY_PATH:/usr/src/lib:$JAVA_HOME/lib:$JAVA_HOME/lib/amd64/server
export PATH=$PATH:$HOME/bin:$JAVA_HOME/bin:/usr/src:/usr/src/test:/usr/src/NINA_IVR:/usr/bin
