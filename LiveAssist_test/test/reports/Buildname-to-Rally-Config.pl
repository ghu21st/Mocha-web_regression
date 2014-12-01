#-----------------------
#Project: NINA VOICE/IVR/VXML
#company: Nuance Communication Inc.
#Usage: QA script to parse build name from product version.txt for test integration with Anthill pro & Rally
#note: run this script under the same folder with rally.properties file 
#-----------------------
#!/usr/local/bin/perl
##!/usr/bin/env perl
use FileHandle;
#use strict;

my $build_loc = "c:\\LiveAssist_test\\test";
my $version_filename = "version.txt";
my $rally_filename = "rally.properties";
my $version_file = $build_loc."\\".$version_filename;
my $rally_file = $build_loc."\\reports\\".$rally_filename; 
my $build_version = "";
my $rally_temp = "";

print "\nVersion file: $version_file\nRally config file: $rally_file\n";

#get the build # from version file
open(IN1, "+<$version_file") || die "Cann't open $version_file: $! \n";
if(IN1 != -1){
	$build_version = <IN1>;
	chomp($build_version);
}else{
	$build_version = "Unknown-build";
}
close(IN1);
print "\nGot build name: $build_version\n";

#read content from rally.properties file to temp
open(IN2, "+<$rally_file") || die "Cann't open $rally_file: $!\n";
while(<IN2>){
   $rally_temp=$rally_temp.$_;
}
close(IN2);
print "\nRally properties file content:\n $rally_temp \n";

#add build version
my $search_key = "build=.+";
my $replace_key = "build=".$build_version;

if($rally_temp =~ s/$search_key/$replace_key/){
	print "Replace build line:\n$rally_temp\n";
	#write temp content to rally.properties 
	open(IN3, ">$rally_file") || die "Cann't open $rally_file: $! \n";
	print IN3 $rally_temp;
	close(IN3);
}else{
	print "Replacing build version failed\n";
}




