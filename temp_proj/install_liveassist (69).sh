#!/bin/bash
# Shell script to install LiveAssist on linux
# Created April 28, 2014 by George Broughton, Nuance Communications Inc. (Montreal)
#
# Updated Nov 24, 2014 George Broughton

# Install type 3 is implicitly handled. See below.

PRODUCT_NAME="Nuance Live Assist"
LA_MSTATION_RPM_NAME=liveassist-mstation-2.1.1-201412042004.el6.i386.rpm
LA_RPM_NAME=liveassist-2.1.1-201412042004.el6.i386.rpm

LA_PROFILE_FILENAME=/etc/profile.d/501-SETUP-liveassist-java.sh
NUANCE=${NUANCE:-'/usr/local/Nuance/Common'}
MSERVER_HOSTS_FILE=$NUANCE/data/oam/mserver_hosts.txt
CURRENTDIR=`pwd`
APPLICATION_RPM="LiveAssist"
JAVA_VERSTION_STRING="1.7"
VALID_JAVA_VERSION_STRING="build $JAVA_VERSTION_STRING"
DEFAULT_JAVA_HOME=/usr/local/jdk1.7.0_25-i586
DEFAULT_INSTALL_PREFIX="/usr/local"
MSTATION_INSTALL_PREFIX="/usr/local"
MGMT_STATION_STRING=""
INSTALLTYPE_1="1. Full Live Assist Service installation or upgrade on CentOS server"
INSTALLTYPE_2="2. Live Assist Audio Service only installation or upgrade on CentOS server"
INSTALLTYPE_3="3. Live Assist OAM file only installation or upgrade on Management Station server"
INSTALLTYPE_STRING=""

if [[ ! -z "$1" ]]; then
    if [[ "$1" != "y" && "$1" != "Y" ]]; then
        UNATTENDED=N
        echo ""
        echo "usage:"
        echo "  sh install_liveassist.sh"
        echo "  sh install_liveassist.sh Y {1|2|3} localhost:8080 /usr/local"
        echo ""
        echo "Exiting ..."
        echo ""
        exit 1
    else
        UNATTENDED=$1
        INSTALLTYPE=${2:-"1"}
        IN_MGMT_STATION_STRING=${3:-"localhost:8080"}
        INSTALLPREFIX=${4:-"$DEFAULT_INSTALL_PREFIX"}
    fi
fi


# Functions
checkJava() {
    if [[ -f "$IN_JAVA_HOME/bin/java" ]]; then
        `$IN_JAVA_HOME/bin/java -version`
        if [[ "$?" != "0" ]]; then
            echo ""
            echo "Error running the version check on the JDK in $IN_JAVA_HOME!"
            echo ""
        else
            `$IN_JAVA_HOME/bin/java -version >/tmp/liveassist_javaversion.txt 2>&1`
            test=`cat /tmp/liveassist_javaversion.txt | grep "$VALID_JAVA_VERSION_STRING"`
            if [[ ! -z "$test" ]]; then
                test=`cat /tmp/liveassist_javaversion.txt | grep '64-Bit'`
                if [[ -z "$test" ]]; then
                    ANSWER="$IN_JAVA_HOME"
                    LIVEASSIST_JAVA_HOME=$ANSWER
                else
                    echo ""
                    echo "Java version in $IN_JAVA_HOME is not 32 Bit !"
                    echo ""
                fi
            else
                echo ""
                echo "Java version in $IN_JAVA_HOME is not $JAVA_VERSION_STRING !"
                echo ""
            fi
        fi
    else
        echo ""
        echo "There is no Java in $IN_JAVA_HOME!"
        echo ""
    fi
}

installJava() {
    echo ""
    echo "Installing JDK $IN_JDK"
    echo ""
    tar -C $IN_JAVA_HOME --strip-components=1 –xzvf $IN_JDK
    if [[ "$?" != "0" ]]; then
        echo "Error installing JDK $IN_JDK"
        echo "Exiting ..."
        echo ""
        exit 1
    fi
    checkJava
}

copyFile() {
    IN_FROMPATH=$IN_FROMDIR/$IN_FILENAME
    IN_TOPATH=$IN_TODIR/$IN_FILENAME
    if [[ -f $IN_TOPATH ]]; then
        diff $IN_FROMPATH $IN_TOPATH
        if [[ "$?" == "0" ]]; then
            echo "$IN_TOPATH is already the same as $IN_FROMPATH"
        else
            echo "Replacing $IN_TOPATH with $IN_FROMPATH"
            cp --backup=numbered $IN_FROMPATH $IN_TOPATH
        fi
    else
        echo "Copy $IN_FROMPATH to $IN_TOPATH"
        cp $IN_FROMPATH $IN_TOPATH
    fi
}

echo -e " "
echo -e "----------------------------"
echo -e "Nuance Live Assist"
echo -e "----------------------------"
echo -e " "
echo -e "$INSTALLTYPE_1"
echo -e "$INSTALLTYPE_2"
echo -e "$INSTALLTYPE_3"
echo -e " "
echo -e "For installation types 1 and 2 you must supply a 32 bit JDK 7 location.\nE.g. $DEFAULT_JAVA_HOME".
echo -e " "
echo -e "LA needs CentOS 5 or 6, glibc.i686 and mysql-server."
echo -e "iptables and SELinux should be disabled."
echo -e " "
echo -e "You must supply the Management Station host and port.\nE.g. mtl-da53:8080."
echo -e " "
echo -e "If not already installed, the Nuance-Common and Nuance-OAM rpm files"
echo -e "must be present in the same folder as the liveassist rpm file."
echo -e " "

if [[ -f $LA_PROFILE_FILENAME ]]; then
    source "$LA_PROFILE_FILENAME"
fi

REPLY=N
while [[ $REPLY != "Y" ]]; do
    if [[ -z $UNATTENDED ]]; then
        # Get INSTALLTYPE
        ANSWER=x
        while [[ $ANSWER == "x" ]]; do
            echo -e "Please give the type of installation (enter 1, 2 or 3):"
            echo -e " "
            echo -e "$INSTALLTYPE_1"
            echo -e "$INSTALLTYPE_2"
            echo -e "$INSTALLTYPE_3"
            echo -e " "
            echo -e "(Enter Ctrl-C to exit)"
            echo -e " "
            read ans
            if [[ -z "$ans" ]]; then
                ans=x
            else
                if [[ $ans != "1" && $ans != "2" && $ans != "3" ]]; then
                    echo "$ans is not permitted! Please choose 1, 2 or 3."
                    ans=x
                else
                    ANSWER=$ans
                    INSTALLTYPE=$ANSWER
                fi
            fi
        done
    fi

    # Set INSTALLTYPE_STRING
    if [[ $INSTALLTYPE == "1" ]]; then
        INSTALLTYPE_STRING=$INSTALLTYPE_1
    elif [[ $INSTALLTYPE == "2" ]]; then
        INSTALLTYPE_STRING=$INSTALLTYPE_2
    elif [[ $INSTALLTYPE == "3" ]]; then
        INSTALLTYPE_STRING=$INSTALLTYPE_3
    fi

    # Check full install and audio server install prereq
    if [[ $INSTALLTYPE == "1" || $INSTALLTYPE == "2" ]]; then

        # Check for existing Live Assist installed
        rpm -q liveassist > /dev/null 2>&1
        if [[ "$?" = "0" ]]; then
            echo ""
            echo ""
            echo "Nuance Live Assist is already installed, upgrading."
            echo ""
        fi

        # Check OS version
        OS=`egrep '(CentOS release 5|CentOS release 6)' /etc/redhat-release`
        if [[ -z "$OS" ]]; then
            echo ""
            echo "Type 1 and 2 installations require CentOS 5.x or CentOS 6.x"
            echo "Exiting ..."
            echo ""
            exit 1    
        fi

        # Check iptables
        test=`iptables -L | grep REJECT`
        if [[ ! -z "$test" ]]; then
            echo ""
            echo "WARNING: The iptables firewall might be blocking ports required by Live Assist:"
            /sbin/service iptables status
            echo ""
            if [[ -z $UNATTENDED ]]; then
                echo "Do you want to abort the installation? (Y / n): "
                read ans
                if [[ -z $ans || "$ans" == "y" || "$ans" == "Y" ]]; then
                    echo "Exiting ..."
                    echo ""
                    exit 1
                fi
            fi
        fi    

        # Check SELinux
        test=`cat /etc/selinux/config | grep "SELINUX=disabled"`
        if [[ -z "$test" ]]; then
            echo ""
            echo "WARNING: SELinux might affect Live Assist operation:"
            cat /etc/selinux/config
            echo ""
            if [[ -z $UNATTENDED ]]; then
                echo "Do you want to abort the installation? (Y / n): "
                read ans
                if [[ -z $ans || "$ans" == "y" || "$ans" == "Y" ]]; then
                    echo "Exiting ..."
                    echo ""
                    exit 1
                fi
            fi
        fi    

        # Check 32 bit lib
        rpm -q glibc.i686  > /dev/null 2>&1 
        if [[ "$?" != "0" ]]; then
            echo ""
            echo "Live Assist requires the 32 bit C library."
            if [[ -z "$UNATTENDED" ]]; then
                echo "Do you want to install it from the CentOS repository? (Y / n): "
                read ans
                if [[ -z $ans || "$ans" == "y" || "$ans" == "Y" ]]; then
                    ans=Y
                fi
            else
                ans=Y
            fi
            if [[ "$ans" == "Y" ]]; then
                yum install glibc.i686
                if [[ "$?" != "0" ]]; then
                    echo "Error installing glibc.i686"
                    echo "Exiting ..."
                    echo ""
                    exit 1
                fi
            else
                echo "Exiting ..."
                echo ""
                exit 1
            fi
        fi

        # Check Java
        ANSWER=x
        while [[ "$ANSWER" == "x" ]]; do
            IN_JAVA_HOME=${LIVEASSIST_JAVA_HOME:-$DEFAULT_JAVA_HOME}
            if [[ -z "$UNATTENDED" ]]; then
                echo ""
                echo "Please enter path to 32 bit JDK 7 location ($IN_JAVA_HOME): "
                read ans
                if [[ -z $ans ]]; then
                    ans=$IN_JAVA_HOME
                fi
            else
                ans=$IN_JAVA_HOME
            fi
            if [[ "$ans" == "/" ]]; then
                echo "$ans is not permitted! Please choose another path."
            elif [[ ! -z "$ans" ]]; then
                IN_JAVA_HOME=$ans
                checkJava
                if [[ "$ANSWER" == "x" ]]; then
                    IN_JDK=`ls jdk-7u*-linux-i586.tar.gz | tail -1`
                    if [[ ! -z "$IN_JDK" ]]; then
                        # JDK provided in package
                        if [[ -z "$UNATTENDED" ]]; then
                            echo ""
                            echo "Do you wan't to install the JDK $IN_JDK to $IN_JAVA_HOME (Y / n): "
                            read ans
                            if [[ -z $ans || "$ans" == "y" || "$ans" == "Y" ]]; then
                                ans=Y
                            fi
                        else
                            ans=Y
                        fi
                        if [[ "$ans" == "Y" ]]; then
                            installJava
                        fi
                    fi
                fi
            else
                echo ""
                echo "That is not a valid absolute path!"
                echo ""
            fi
            if [[ "$ANSWER" == "x"  && ! -z "$UNATTENDED" ]]; then
                echo "Exiting ..."
                echo ""
                exit 1
            fi
        done

        # Check mserver hosts file
        ANSWER=x
        if [[ -f $MSERVER_HOSTS_FILE ]]; then
            MGMT_STATION_STRING=`cat $MSERVER_HOSTS_FILE`
        fi
        if [[ -z $UNATTENDED ]]; then
            IN_MGMT_STATION_STRING=$MGMT_STATION_STRING
            while [[ "$ANSWER" == "x" ]]; do
                echo "Please supply the Management Station host and port e.g. mtl-da53:8080"
                echo "Please enter colon separated host and port values ($IN_MGMT_STATION_STRING): "      
                read ans
                if [[ -z $ans ]]; then
                    ans=$IN_MGMT_STATION_STRING
                fi
                test=`echo $ans | grep ":"`
                if [[ -z $test ]]; then
                    echo "Missing colon in Management Station and port string"
                else
                    IN_MGMT_STATION_STRING=$ans
                    ANSWER=$ans
                fi
            done
        fi
    fi

    if [[ "$INSTALLTYPE" == "1" ]]; then
        # Check prereqs for full install
        # Check for mysql
        rpm -qa | grep -i mysql-server > /dev/null 2>&1
        if [[ "$?" != "0" ]]; then
            if [[ -z $UNATTENDED ]]; then
                echo ""
                echo "The Live Assist service requires a mysql server."
                echo "Do you want to install it from the CentOS repository? (Y / n): "
                read ans
                if [[ -z $ans || "$ans" == "y" ]]; then
                    ans=Y
                fi
            else
                ans=Y
            fi
            if [[ "$ans" == "Y" ]]; then
                yum install mysql-server
                if [[ "$?" != "0" ]]; then
                    echo "Error installing mysql-server"
                    echo "Exiting ..."
                    echo ""
                    exit 1
                fi
                chkconfig --level 345 mysqld on
                service mysqld start
            else
                echo "Exiting ..."
                echo ""
                exit 1
            fi
        fi
    fi

    if [[ $INSTALLTYPE == "1" || $INSTALLTYPE == "2" ]]; then
        rpm -q  Nuance-Common  > /dev/null 2>&1
        if [[ "$?" != "0" ]]; then
            echo ""
            echo "Installing Nuance Common"
            echo ""
            RPMFOUND=`ls Nuance-Common*.rpm | tail -1`
            if [[ ! -z "$RPMFOUND" ]]; then
                RPMS_TO_INSTALL="$RPMFOUND"
                /bin/rpm -Uvh  Nuance-Common*
                if [[ "$?" != "0" ]]; then
                    echo "Error installing Nuance-Common rpm "
                    echo "Exiting ..."
                    echo ""
                    exit 1
                fi
            else
                echo ""
                echo ""
                echo "The Nuance-Common rpm file is missing in the current directory."
                echo ""
                echo "Please check the directory where you extracted the downloaded"
                echo "archive for this rpm."
                echo ""
                echo "Exiting ..."
                echo ""
                exit 1
            fi
        fi

        rpm -q  Nuance-OAM  > /dev/null 2>&1
        if [[ "$?" != "0" ]]; then
            echo ""
            echo "Installing Nuance OAM"
            echo ""
            RPMFOUND=`ls Nuance-OAM*.rpm | tail -1`
            if [[ ! -z "$RPMFOUND" ]]; then
                RPMS_TO_INSTALL="$RPMFOUND"
                /bin/rpm -Uvh  Nuance-OAM*
                if [[ "$?" != "0" ]]; then
                    echo "Error installing Nuance-OAM rpm "
                    echo "Exiting ..."
                    echo ""
                    exit 1
                fi
            else
                echo ""
                echo ""
                echo "The Nuance-OAM rpm file is missing in the current directory."
                echo ""
                echo "Please check the directory where you extracted the downloaded"
                echo "archive for this rpm."
                echo ""
                echo "Exiting ..."
                echo ""
                exit 1
            fi
        fi

        if [[ "$IN_MGMT_STATION_STRING" != "$MGMT_STATION_STRING" ]]; then
            MGMT_STATION_STRING=$IN_MGMT_STATION_STRING
            echo ""
            echo "Setting $MSERVER_HOSTS_FILE to $MGMT_STATION_STRING"
            echo ""
            echo "$MGMT_STATION_STRING" > $MSERVER_HOSTS_FILE
        fi

    fi

    if [[ -z $UNATTENDED ]]; then
        PROMPT="Live Assist would like to use prefix /usr/local, but you may choose another path."

        ANSWER=x
        while [[ "$ANSWER" == "x" ]]; do
            echo ""
            echo $PROMPT
            echo "Please enter an absolute path ($DEFAULT_INSTALL_PREFIX): "
            read ans
            if [[ -z "$ans" ]]; then
                ans="$DEFAULT_INSTALL_PREFIX"
            else
                ans=`echo $ans | sed '/^\/[[0-9a-zA-Z/_\-\.\:]]*$/!d'`
            fi

            if [[ "$ans" == "/" ]]; then
                echo "$ans is not permitted! Please choose another path."
                ans=""
            elif [[ ! -z "$ans" ]]; then
                ANSWER="$ans"
            else
                echo ""
                echo "That is not a valid absolute path!"
                echo ""
            fi
        done
        INSTALLPREFIX="$ANSWER"
    fi

    echo -e "Confirming entries ..."
    echo -e "Installation prefix  : $INSTALLPREFIX"
    echo -e "Installation type    : $INSTALLTYPE_STRING"
    if [[ ! -z $LIVEASSIST_JAVA_HOME ]]; then
        echo -e "32 bit JDK 7 location: $LIVEASSIST_JAVA_HOME"
    fi
    if [[ ! -z $MGMT_STATION_STRING ]]; then
        echo -e "Management Station/Port : $MGMT_STATION_STRING"
    fi
    echo -e ""
    if [[ -z $UNATTENDED ]]; then
        echo -e "Hit Ctrl-C to exit, n to re-enter data, y to continue"
        echo -e ""
        echo -n "Do you wish to continue with installation? (y / n): "
        read REPLY
        if [[ "$REPLY" == "Y" || "$REPLY" == "y" ]]; then
            REPLY=Y
        else
            REPLY=N
        fi
    else
        REPLY=Y
    fi
done

if [[ $INSTALLTYPE == "1" || $INSTALLTYPE == "2" ]]; then
    export LIVEASSIST_JAVA_HOME=$LIVEASSIST_JAVA_HOME
    if [[ "$?" != "0" ]]; then
       echo "LIVEASSIST_JAVA_HOME could not be set. Installation abort!"
       echo "Exiting ..."
       echo ""
       exit 1
    fi

    echo "setting profile $LA_PROFILE_FILENAME"
    echo "It will contain the following:"
    echo "export LIVEASSIST_JAVA_HOME=$LIVEASSIST_JAVA_HOME"
    echo "export LIVEASSIST_JAVA_HOME=\"$LIVEASSIST_JAVA_HOME\"" > "$LA_PROFILE_FILENAME"


    cd $CURRENTDIR

    # installing Nuance LiveAssist

    echo "Installing Nuance LiveAssist"
    echo ""


    RPMFOUND=`ls $LA_RPM_NAME | tail -1`
    if [[ ! -z "$RPMFOUND" ]]; then
        RPMS_TO_INSTALL="$RPMFOUND"
    else
        echo ""
        echo ""
        echo "The $PRODUCT_NAME rpm file is missing in the current directory."
        echo ""
        echo "Please check the directory where you extracted the downloaded"
        echo "archive for this rpm."
        echo ""
        echo ""
        exit 1
    fi

    echo ""
    echo "Installing Nuance LiveAssist package $RPMS_TO_INSTALL to $INSTALLPREFIX"
    echo " "
    /bin/rpm -Uvh --replacefiles --replacepkgs --prefix "$INSTALLPREFIX" $RPMS_TO_INSTALL

    if [[ "$?" != "0" ]]; then
         echo ""
         echo "Error installing LiveAssist rpm "
         echo "Exiting ..."
         echo ""
         exit 1
    fi

    source "$LA_PROFILE_FILENAME"
    if [[ "$?" != "0" ]]; then
        echo ""
        echo "cannot source the file"
        echo "Exiting ..."
        echo ""
        exit 1
    fi
fi


if [[ "$INSTALLTYPE" == "1" ]]; then
    
# -----------------------------------------------------
# Create databases
# ----------------------------------------------------

    mysqlshow > /dev/null 2>&1
    if [[ "$?" != "0" ]]; then
        echo ""
        echo "cannot list databases, verify that MySQL is installed and started"
        echo "Exiting ..."
        echo ""
        exit 1
    fi

    mysqlshow liveassist > /dev/null 2>&1
    if [[ "$?" != "0" ]]; then
        echo ""
        echo "Creating Live Assist database"
        mysql < $INSTALLPREFIX/Nuance/liveassist/liveassist-server/bin/create_db.sql
        mysql -u root -e "CREATE USER 'liveassist'@'localhost' IDENTIFIED BY 'liveassist';"
        mysql -u root -e "GRANT ALL PRIVILEGES ON liveassist.* TO 'liveassist'@'localhost' IDENTIFIED BY 'liveassist';"
        mysql -u root -e "FLUSH PRIVILEGES;"
        echo ""
    fi

    mysqlshow liveassist general > /dev/null 2>&1
    if [[ "$?" != "0" ]]; then
        echo ""
        echo "Upgrading to 1.0.1 database version"
        mysql < $INSTALLPREFIX/Nuance/liveassist/liveassist-server/bin/db/upgrade_db_1.0.1.sql
    fi
    DBVERSION=$(mysql -ss -e "select version from general;" liveassist)
    if [[ "$DBVERSION" == "1.0.1" ]]; then
        echo ""
        echo "Upgrading to 1.0.2 database version"
        mysql < $INSTALLPREFIX/Nuance/liveassist/liveassist-server/bin/db/upgrade_db_1.0.2.sql
        DBVERSION=$(mysql -ss -e "select version from general;" liveassist)
    fi
    if [[ "$DBVERSION" == "1.0.2" ]]; then
        echo ""
        echo "Upgrading to 1.0.3 database version"
        mysql < $INSTALLPREFIX/Nuance/liveassist/liveassist-server/bin/db/upgrade_db_1.0.3.sql
        DBVERSION=$(mysql -ss -e "select version from general;" liveassist)
    fi
    if [[ "$DBVERSION" == "1.0.3" ]]; then
        echo ""
        echo "Upgrading to 1.0.4 database version"
        mysql < $INSTALLPREFIX/Nuance/liveassist/liveassist-server/bin/db/upgrade_db_1.0.4.sql
        DBVERSION=$(mysql -ss -e "select version from general;" liveassist)
    fi
    if [[ "$DBVERSION" == "1.0.4" ]]; then
        echo ""
        echo "Upgrading to 1.0.5 database version"
        mysql < $INSTALLPREFIX/Nuance/liveassist/liveassist-server/bin/db/upgrade_db_1.0.5.sql
        DBVERSION=$(mysql -ss -e "select version from general;" liveassist)
    fi
    if [[ "$DBVERSION" == "1.0.5" ]]; then
        echo ""
        echo "Upgrading to 2.0.0 database version"
        mysql < $INSTALLPREFIX/Nuance/liveassist/liveassist-server/bin/db/upgrade_db_2.0.0.sql
        DBVERSION=$(mysql -ss -e "select version from general;" liveassist)
    fi
    if [[ "$DBVERSION" == "2.0.0" ]]; then
        echo ""
        echo "Upgrading to 2.0.1 database version"
        mysql < $INSTALLPREFIX/Nuance/liveassist/liveassist-server/bin/db/upgrade_db_2.0.1.sql
        DBVERSION=$(mysql -ss -e "select version from general;" liveassist)
    fi
    if [[ "$DBVERSION" == "2.0.1" ]]; then
        echo ""
        echo "Upgrading to 2.0.2 database version"
        mysql < $INSTALLPREFIX/Nuance/liveassist/liveassist-server/bin/db/upgrade_db_2.0.2.sql
        DBVERSION=$(mysql -ss -e "select version from general;" liveassist)
    fi
    if [[ "$DBVERSION" == "2.0.2" ]]; then
        echo ""
        echo "Upgrading to 2.0.3 database version"
        mysql < $INSTALLPREFIX/Nuance/liveassist/liveassist-server/bin/db/upgrade_db_2.0.3.sql
        DBVERSION=$(mysql -ss -e "select version from general;" liveassist)
    fi
    if [[ "$DBVERSION" == "2.0.3" ]]; then
        echo ""
        echo "Upgrading to 2.0.4 database version"
        mysql < $INSTALLPREFIX/Nuance/liveassist/liveassist-server/bin/db/upgrade_db_2.0.4.sql
        DBVERSION=$(mysql -ss -e "select version from general;" liveassist)
    fi
    if [[ "$DBVERSION" == "2.0.4" ]]; then
        echo ""
        echo "The database is now at version 2.0.4"
    else
        echo ""
        echo "An error occurred upgrading the database"
        echo "Exiting..."
        echo ""
        exit 1
    fi
fi

# This is done for all installation types (1, 2 and 3) based on the
# presence of MS
if [[ -d $MSTATION_HOME/mserver/webapps/mserver ]]; then

    cd $CURRENTDIR

    # Installing on a Management Station host
    echo ""
    echo "Installing service, message catalogs and roles to Management Station"
    MSTATION_INSTALL_PREFIX=$(echo $MSTATION_HOME |  awk -F'/Nuance' '{print $1}')
    RPMFOUND=`ls $LA_MSTATION_RPM_NAME | tail -1`
    if [[ ! -z "$RPMFOUND" ]]; then
        RPMS_TO_INSTALL="$RPMFOUND"
    else
        echo ""
        echo ""
        echo "The $LA_MSTATION_RPM_NAME file is missing in the current directory."
        echo ""
        echo "Please check the directory where you extracted the downloaded"
        echo "archive for this rpm."
        echo ""
        echo ""
        exit 1
    fi
    echo ""
    echo "Installing Live Assist Management Station package $RPMS_TO_INSTALL to $MSTATION_INSTALL_PREFIX"
    echo " "
    /bin/rpm -Uvh --replacefiles --replacepkgs --prefix "$MSTATION_INSTALL_PREFIX" $RPMS_TO_INSTALL

    if [[ "$?" != "0" ]]; then
         echo ""
         echo "Error installing Live Assist rpm Management Station"
         echo "Exiting ..."
         echo ""
         exit 1
    fi
fi


echo ""
echo ""
echo "Nuance LiveAssist is successfully installed!"
if [[ ! -d $MSTATION_HOME/mserver/webapps/mserver ]]; then
    echo ""
    echo "Please run this installation script with option 3 on the "
    echo "Management Station host to install the Live Assist OAM files."
fi
echo "Please use Management Station, Network Design to assign the appropriate "
echo "Live Assist role to the host."
echo ""
