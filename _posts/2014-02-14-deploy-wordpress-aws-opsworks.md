---
id: 1105
title: Deploy WordPress with AWS OpsWorks
date: 2014-02-14T08:20:48+00:00
author: Christian Elsen
excerpt: How to automatically deploy Wordpress with AWS OpsWorks for a new site, as part of a disaster recovery (DR) setup, for Dev/Test or for a fresh blank site.
layout: single
permalink: /2014/02/14/deploy-wordpress-aws-opsworks/
redirect_from: 
  - /2014/02/14/deploy-wordpress-aws-opsworks/amp/
  - /2014/02/deploy-wordpress-aws-opsworks/
categories:
  - EdgeCloud
tags:
  - AWS
---
[AWS OpsWorks](https://aws.amazon.com/opsworks/) is an application management service that makes it easy for DevOps users to model and manage the entire application from load balancers to databases. It offers a very powerful solution for users to deploy their application easily in AWS without giving up control.

In this post I want to show you how easy it is to use AWS OpsWorks for deploying WordPress - a typical [LAMP](https://en.wikipedia.org/wiki/LAMP_(software_bundle)) application. This includes deploying a fresh blank WordPress install as well as re-creating a WordPress site from a backup for Dev/Test or Disaster Recovery purposes. In all cases it should take you only a few minutes to have a running WordPress site.

While I use a Webhoster for running Edge Cloud, I do use the described approach to test changes to WordPress before deploying them into production. And I thereby also know that I could restore Edge Cloud as part of a Disaster Recovery (DR) plan via this approach.

### About Opsworks

With the availability of AWS OpsWorks Amazon Web Services now has a number of different Application Management Services that address the different needs of Administrators and Developers (See Figure 1).

<div id="attachment_1107" style="width: 610px" class="wp-caption aligncenter">
  <img src="/content/uploads/2014/02/app-svcs-comparison-graphic.png" alt="Figure 1: OpsWorks fit in the AWS Application Management Solutions" width="600" height="235" class="size-full wp-image-1107" srcset="/content/uploads/2014/02/app-svcs-comparison-graphic.png 600w, /content/uploads/2014/02/app-svcs-comparison-graphic-360x141.png 360w, /content/uploads/2014/02/app-svcs-comparison-graphic-1x1.png 1w" sizes="(max-width: 600px) 100vw, 600px" />

  <p class="wp-caption-text">
    Figure 1: OpsWorks fit in the AWS Application Management Solutions
  </p>
</div>

  * [AWS Elastic Beanstalk](https://aws.amazon.com/elasticbeanstalk/) is an easy-to-use solution for building web apps and web services with popular application containers such as Java, PHP, Python, Ruby and .NET. You upload your code and Elastic Beanstalk automatically does the rest. Elastic Beanstalk supports the most common web architectures, application containers, and frameworks.
  * [AWS OpsWorks](https://aws.amazon.com/opsworks/) is a powerful end-to-end solution that gives you an easy way to manage applications of nearly any scale and complexity without sacrificing control. You model, customize, and automate the entire application throughout its lifecycle. OpsWorks provides integrated experiences for IT administrators and ops-minded developers who want a high degree of productivity and control over operations.
  * [AWS CloudFormation](https://aws.amazon.com/cloudformation/) is a building block service that enables customers to provision and manage almost any AWS resource via a domain specific language. You define JSON templates and use them to provision and manage AWS resources, operating systems and application code. CloudFormation focuses on providing foundational capabilities for the full breadth of AWS, without prescribing a particular model for development and operations.

### Use case

The goal for this post will be to use AWS OpsWorks to deploy a WordPress site, automating as much of the deployment as possible. We will include two distinct use cases:

  * **Fresh blank site:** Create a fresh blank WordPress site that you can use to start hosting your own blog.
  * **Re-Created site from an existing backup:** If you have an existing WordPress site, you can use a WordPress Backup Plugin, such as [BackWPup](https://wordpress.org/plugins/backwpup/). Using AWS OpsWorks will allow you to recover your WordPress site from a backup as a Dev/Test site. This way you can e.g. test installing a new plugin before doing so in the production site. But you can also use the recovered WordPress site for a disaster recovery scenario in case your primary site is hard down. The benefit here is that the recovery can happen almost entirely automated, which is always a good idea for a DR solution.

Even though we will run the WordPress site in AWS, we will not make use of AWS cloud concepts in order to achieve high availability for coping with AWS failures. Instead we will keep it very simple (See Figure 2).

<div id="attachment_1108" style="width: 462px" class="wp-caption aligncenter">
  <img src="/content/uploads/2014/02/Architecture.png" alt="Figure 2: Architecture for a simple WordPress deployment in AWS" width="452" height="441" class="size-full wp-image-1108" srcset="/content/uploads/2014/02/Architecture.png 452w, /content/uploads/2014/02/Architecture-360x351.png 360w, /content/uploads/2014/02/Architecture-1x1.png 1w" sizes="(max-width: 452px) 100vw, 452px" />

  <p class="wp-caption-text">
    Figure 2: Architecture for a simple WordPress deployment in AWS
  </p>
</div>

The deployed architecture will include:

  * **WordPress PHP App:** An EC2 server running Ubuntu Linux with an Apache webserver to host the WordPress PHP application. End-users will be able to access the site via an Elastic IP, which guarantees that the IP address - or an associated DNS entry - will remain in place, even if the environment is rebuild.
  * **MySQL Server:** An EC2 server running Ubuntu Linux with MySQL. MySQL will host the database for the WordPress application.
  * **Existing Backup (Optional):** A full backup of an existing WordPress site as a Zip file in a S3 bucket.
  * **WordPress source code (Optional):** The WordPress source code - available at [www.wordpress.org](https://wordpress.org/) for a fresh install of WordPress.

### Getting Started with AWS OpsWorks

Let's head over to the AWS OpsWorks console at [console.aws.amazon.com/opsworks](https://console.aws.amazon.com/opsworks) to get started. Login with your existing AWS credentials. AWS OpsWorks itself is a global service and you therefore do not need to pick a region at this point.

Creating a service or application in AWS OpsWorks includes 4 steps (See Figure 3):

  1. **Add a stack:** Define a stack for an application which includes information about e.g. the AWS region. You can have multiple stacks in various regions.
  2. **Add layers:** Each stack consist of one or more layers, with each layer having a certain function. Here we will use a PHP App Server layer and a MySQL database layer.
  3. **Add an app:** Define the application to be run via a source code repository or file bundle. This includes the ability to use [Subversion](https://github.com/" target="_blank">Github</a> and <a href="https://en.wikipedia.org/wiki/Apache_Subversion), a simple Zip file via a HTTP or HTTPS URL or a ZIP file in a S3 bucket.
  4. **Deploy and manage:** Deploy the application by starting the layer's instances. Manage further capabilities such as deploying another application version at runtime.

<div id="attachment_1118" style="width: 610px" class="wp-caption aligncenter">
  <img src="/content/uploads/2014/02/Steps.png" alt="Figure 3: AWS OpsWorks Deployment Steps" width="600" height="155" class="size-full wp-image-1118" srcset="/content/uploads/2014/02/Steps.png 600w, /content/uploads/2014/02/Steps-360x93.png 360w, /content/uploads/2014/02/Steps-1x1.png 1w" sizes="(max-width: 600px) 100vw, 600px" />

  <p class="wp-caption-text">
    Figure 3: AWS OpsWorks Deployment Steps
  </p>
</div>

### Add a stack

First we will deploy a new stack, which will correspond to the WordPress application. AWS Opsworks also lets you clone an existing stack, which provides capabilities for additional interesting use cases.

Within the AWS OpsWorks console click on _Add Your First Stack_ (See Figure 4).



<div id="attachment_1109" style="width: 610px" class="wp-caption aligncenter">
  <img src="/content/uploads/2014/02/Opsworks01.png" alt="Figure 4: Add your first stack" width="600" height="217" class="size-full wp-image-1109" srcset="/content/uploads/2014/02/Opsworks01.png 600w, /content/uploads/2014/02/Opsworks01-360x130.png 360w, /content/uploads/2014/02/Opsworks01-1x1.png 1w" sizes="(max-width: 600px) 100vw, 600px" />

  <p class="wp-caption-text">
    Figure 4: Add your first stack
  </p>
</div>

Next configure the basic information of your new stack. Give it a useful _Name_ such as _WordPress_ and select your _Region_. Select your preferred _Default Operating System_. Personally I prefer Ubuntu over Amazon Linux. If you want to login to the created EC2 instances via SSH, make sure to select a valid _Default SSH key_. All other settings you can leave as is for now. Click on the _Advanced_ link at the bottom of the page for further configuration options.

<div id="attachment_1110" style="width: 610px" class="wp-caption aligncenter">
  <img src="/content/uploads/2014/02/Opsworks02.png" alt="Figure 5: Add Stack - Step 1" width="600" height="460" class="size-full wp-image-1110" srcset="/content/uploads/2014/02/Opsworks02.png 600w, /content/uploads/2014/02/Opsworks02-360x276.png 360w, /content/uploads/2014/02/Opsworks02-1x1.png 1w" sizes="(max-width: 600px) 100vw, 600px" />

  <p class="wp-caption-text">
    Figure 5: Add Stack - Step 1
  </p>
</div>

AWS OpsWorks uses the configuration management tool [Chef](https://www.chef.io/chef/) to configure the EC2 instances within each layer. For this it provides so-called Chef "recipes" that describe how server applications (such as Apache or MySQL) are managed and how they are to be configured. These recipes describe a series of resources that should be in a particular state: packages that should be installed, services that should be running, or files that should be written.

While AWS OpsWorks provides many useful recipes out of the box we want to add a few minor custom recipes. In particulare we will use two custom recipes which can be found at [https://github.com/chriselsen/opsworks-cookbooks](https://github.com/chriselsen/opsworks-cookbooks):

  * AWS-Ubuntu: Configure an AWS Opsworks Ubuntu image with a swap space. This is aimed at t1.micro instances to prevent "out of memory" issues.
  * WordPress: Configure WordPress via the wp-config.php file to interact with the MySQL server. It can be used for a fresh install or a restore from a Backup using BackWPup. The wp-config.php will be filled with the IP address and credentials to access the MySQL server.

You don't need to understand or even recreate these recipes. I have provided them in a form that allows you to directly use them yourself.

Within the Configuration Management section make sure the selected _Chef version_ is _11.4_ and that _Use custom Chef cookbooks_ is selected with _Yes_. Specify the _Repository type_ with _Git_ and the _Repository URL_ with _https://github.com/chriselsen/opsworks-cookbooks.git_ (See Figure 6).

<div id="attachment_1111" style="width: 490px" class="wp-caption aligncenter">
  <img src="/content/uploads/2014/02/Opsworks03.png" alt="Figure 6: Add Stack - Step 2" width="480" height="322" class="size-full wp-image-1111" srcset="/content/uploads/2014/02/Opsworks03.png 480w, /content/uploads/2014/02/Opsworks03-360x241.png 360w, /content/uploads/2014/02/Opsworks03-1x1.png 1w" sizes="(max-width: 480px) 100vw, 480px" />

  <p class="wp-caption-text">
    Figure 6: Add Stack - Step 2
  </p>
</div>

Next we want to perform some tuning for the components as we will be using the t1.micro instance later on.

The two things to tune will be:

  1. WWW Document Root permission: We want to change the www document root permission to the default user www-data under Ubuntu.
  2. Apache Prefork and Keepalive tuning: As we will be using the memory constraint EC2 flavor t1.micro, we want to make changes to the Apache Prefork and Keepalive settings to better adapt to this flavor type.

In AWS Opsworks the setup and configuration of Apache is performed by Chef recipes that use various parameters which can be controlled by the user via a simple JSON file. This way we don't have to create a custom Chef recipe or even manually perform changes of our servers. Instead we can look up the [apache2 attributes](http://docs.aws.amazon.com/opsworks/latest/userguide/attributes-recipes-apache.html) which are configurable and create a custom JSON file.

This JSON file will look as follows:

<pre>{
  "opsworks" : {
    "deploy_user" : {
      "user" : "www-data"
    }
  },

  "apache" : {
    "timeout" : 40,
    "keepalive" : "On",
    "keepaliverequests" : 200,
    "keepalivetimeout" : 2,
    "prefork" : {
      "startservers" : 3,
      "minspareservers" : 3,
      "maxspareservers" : 10,
      "serverlimit" : 32,
      "maxclients" : 32,
      "maxrequestsperchild" : 2000
    }
  }
}
</pre>

Paste above Chef JSON code into the _Custom Chef JSON_ field. Then click on _Add Stack_ to finalize the creation of the stack (See Figure 7).

<div id="attachment_1112" style="width: 610px" class="wp-caption aligncenter">
  <img src="/content/uploads/2014/02/Opsworks04.png" alt="Figure 7: Add Stack - Step 3" width="600" height="310" class="size-full wp-image-1112" srcset="/content/uploads/2014/02/Opsworks04.png 600w, /content/uploads/2014/02/Opsworks04-360x186.png 360w, /content/uploads/2014/02/Opsworks04-1x1.png 1w" sizes="(max-width: 600px) 100vw, 600px" />

  <p class="wp-caption-text">
    Figure 7: Add Stack - Step 3
  </p>
</div>

This completes the creation of the stack.

### Add Layers

Next is the creation of the application stack layers. One for the PHP App Server layer and one for the MySQL database layer. Let's start with the PHP App Server layer.

After you finished creating the Stack you'll end up on the _Stack_ tab. There under the _Add your first layer section_ click on _Add a layer_ (See Figure 8).

<div id="attachment_1113" style="width: 610px" class="wp-caption aligncenter">
  <img src="/content/uploads/2014/02/Opsworks05.png" alt="Figure 8: Add Layer - Step 1" width="600" height="127" class="size-full wp-image-1113" srcset="/content/uploads/2014/02/Opsworks05.png 600w, /content/uploads/2014/02/Opsworks05-360x76.png 360w, /content/uploads/2014/02/Opsworks05-1x1.png 1w" sizes="(max-width: 600px) 100vw, 600px" />

  <p class="wp-caption-text">
    Figure 8: Add Layer - Step 1
  </p>
</div>

As the _Layer type_ select _PHP App Server_ and click on _Add Layer_ (See Figure 9).

<div id="attachment_1114" style="width: 610px" class="wp-caption aligncenter">
  <img src="/content/uploads/2014/02/Opsworks06.png" alt="Figure 9: Add Layer - Step 2" width="600" height="178" class="size-full wp-image-1114" srcset="/content/uploads/2014/02/Opsworks06.png 600w, /content/uploads/2014/02/Opsworks06-360x106.png 360w, /content/uploads/2014/02/Opsworks06-1x1.png 1w" sizes="(max-width: 600px) 100vw, 600px" />

  <p class="wp-caption-text">
    Figure 9: Add Layer - Step 2
  </p>
</div>

You will see your first layer successfully created. Click on _+ Layer_ to create the next layer (See Figure 10).

<div id="attachment_1115" style="width: 610px" class="wp-caption aligncenter">
  <img src="/content/uploads/2014/02/Opsworks07.png" alt="Figure 10: Add Layer - Step 3" width="600" height="181" class="size-full wp-image-1115" srcset="/content/uploads/2014/02/Opsworks07.png 600w, /content/uploads/2014/02/Opsworks07-360x108.png 360w, /content/uploads/2014/02/Opsworks07-1x1.png 1w" sizes="(max-width: 600px) 100vw, 600px" />

  <p class="wp-caption-text">
    Figure 10: Add Layer - Step 3
  </p>
</div>

As the _Layer type_ select _MySQL_. If you later want to manually connect to the MySQL server - e.g. for troubleshooting - note down the automatically created MySQL root password. Next click on _Add Layer_ (See Figure 11).

<div id="attachment_1116" style="width: 610px" class="wp-caption aligncenter">
  <img src="/content/uploads/2014/02/Opsworks08.png" alt="Figure 11: Add Layer - Step 4" width="600" height="218" class="size-full wp-image-1116" srcset="/content/uploads/2014/02/Opsworks08.png 600w, /content/uploads/2014/02/Opsworks08-360x130.png 360w, /content/uploads/2014/02/Opsworks08-1x1.png 1w" sizes="(max-width: 600px) 100vw, 600px" />

  <p class="wp-caption-text">
    Figure 11: Add Layer - Step 4
  </p>
</div>

We are almost done with the layers. We only need to perform some minor changes on the PHP App Server layer. Therefore in the _PHP App Server_ layer row under _Actions_ click on _Edit_ (See Figure 12).

<div id="attachment_1117" style="width: 610px" class="wp-caption aligncenter">
  <img src="/content/uploads/2014/02/Opsworks09.png" alt="Figure 12: Edit PHP Layer - Step 1" width="600" height="55" class="size-full wp-image-1117" srcset="/content/uploads/2014/02/Opsworks09.png 600w, /content/uploads/2014/02/Opsworks09-360x33.png 360w, /content/uploads/2014/02/Opsworks09-1x1.png 1w" sizes="(max-width: 600px) 100vw, 600px" />

  <p class="wp-caption-text">
    Figure 12: Edit PHP Layer - Step 1
  </p>
</div>

Although we have already pointed AWS OpsWorks to our custom Chef cookbooks, we still need to assign the individual recipes to the correct layer and lifecycle event. In AWS OpsWorks a layer has a sequence of [five lifecycle events](http://docs.aws.amazon.com/opsworks/latest/userguide/workingcookbook-events.html), each of which has an associated set of recipes that are specific to the layer. When an event occurs on a layer's instance, AWS OpsWorks automatically runs the appropriate set of recipes.

For the PHP App Server layer we need to define the following two recipes to lifecycle events (See Figure 13).

  * _Setup_ lifecycle event: Recipe _aws-ubuntu::setup_
  * _Configure_ lifecycle event: Recipe _wordpress::configure_

<div id="attachment_1119" style="width: 610px" class="wp-caption aligncenter">
  <img src="/content/uploads/2014/02/Opsworks10.png" alt="Figure 13: Edit PHP Layer - Step 2" width="600" height="462" class="size-full wp-image-1119" srcset="/content/uploads/2014/02/Opsworks10.png 600w, /content/uploads/2014/02/Opsworks10-360x277.png 360w, /content/uploads/2014/02/Opsworks10-1x1.png 1w" sizes="(max-width: 600px) 100vw, 600px" />

  <p class="wp-caption-text">
    Figure 13: Edit PHP Layer - Step 2
  </p>
</div>

Next scroll down to the _Automatically Assign IP Addresses_ section and set _Elastic IP addresses_ to _Yes_ (See Figure 14).

This assigns a so-called elastic IP address to the PHP App Server EC2 instance, an IP address that remains available even if the concrete EC instance is later replaced. It therefore allows you to place a DNS record on this Elastic IP address.

<div id="attachment_1120" style="width: 610px" class="wp-caption aligncenter">
  <img src="/content/uploads/2014/02/Opsworks11.png" alt="Figure 14: Edit PHP Layer - Step 3" width="600" height="125" class="size-full wp-image-1120" srcset="/content/uploads/2014/02/Opsworks11.png 600w, /content/uploads/2014/02/Opsworks11-360x75.png 360w, /content/uploads/2014/02/Opsworks11-1x1.png 1w" sizes="(max-width: 600px) 100vw, 600px" />

  <p class="wp-caption-text">
    Figure 14: Edit PHP Layer - Step 3
  </p>
</div>

Scroll down to the _Auto Healing_ section and make sure that _Auto healing enabled_ is set to _No_ (See Figure 15). As we will be using EC2 t1.micro instances, these instances can generate a very high load and/or memory usage - especially at boot time. With auto healing enabled it is possible that AWS OpsWorks interprets this as an issue and attempts to rectify it by recreating the corresponding EC2 instance. Therefore with this simple setup it's safer to leave this turned off.

<div id="attachment_1121" style="width: 610px" class="wp-caption aligncenter">
  <img src="/content/uploads/2014/02/Opsworks12.png" alt="Figure 15: Edit PHP Layer - Step 4" width="600" height="106" class="size-full wp-image-1121" srcset="/content/uploads/2014/02/Opsworks12.png 600w, /content/uploads/2014/02/Opsworks12-360x63.png 360w, /content/uploads/2014/02/Opsworks12-1x1.png 1w" sizes="(max-width: 600px) 100vw, 600px" />

  <p class="wp-caption-text">
    Figure 15: Edit PHP Layer - Step 4
  </p>
</div>

Next we need to create EC2 instances, one instance per layer in our case. Start with the _PHP App Server_ layer and select _Add an instance_ (See Figure 16).

<div id="attachment_1122" style="width: 610px" class="wp-caption aligncenter">
  <img src="/content/uploads/2014/02/Opsworks13.png" alt="Figure 16: Add an instance - Step 1" width="600" height="239" class="size-full wp-image-1122" srcset="/content/uploads/2014/02/Opsworks13.png 600w, /content/uploads/2014/02/Opsworks13-360x143.png 360w, /content/uploads/2014/02/Opsworks13-1x1.png 1w" sizes="(max-width: 600px) 100vw, 600px" />

  <p class="wp-caption-text">
    Figure 16: Add an instance - Step 1
  </p>
</div>

As the _Size_ select _t1.micro_ and click on _Add instance_ (See Figure 17).

<div id="attachment_1123" style="width: 610px" class="wp-caption aligncenter">
  <img src="/content/uploads/2014/02/Opsworks14.png" alt="Figure 17: Add an instance - Step 2" width="600" height="255" class="size-full wp-image-1123" srcset="/content/uploads/2014/02/Opsworks14.png 600w, /content/uploads/2014/02/Opsworks14-360x153.png 360w, /content/uploads/2014/02/Opsworks14-1x1.png 1w" sizes="(max-width: 600px) 100vw, 600px" />

  <p class="wp-caption-text">
    Figure 17: Add an instance - Step 2
  </p>
</div>

Now for the _MySQL Server_ layer select _Add an instance_ (See Figure 18).

<div id="attachment_1124" style="width: 610px" class="wp-caption aligncenter">
  <img src="/content/uploads/2014/02/Opsworks15.png" alt="Figure 18: Add an instance - Step 3" width="600" height="332" class="size-full wp-image-1124" srcset="/content/uploads/2014/02/Opsworks15.png 600w, /content/uploads/2014/02/Opsworks15-360x199.png 360w, /content/uploads/2014/02/Opsworks15-1x1.png 1w" sizes="(max-width: 600px) 100vw, 600px" />

  <p class="wp-caption-text">
    Figure 18: Add an instance - Step 3
  </p>
</div>

As the _Size_ select _t1.micro_ and select the same or a different _Availability Zone_ depending on your preference. Click on _Add instance_ (See Figure 19).

<div id="attachment_1125" style="width: 610px" class="wp-caption aligncenter">
  <img src="/content/uploads/2014/02/Opsworks16.png" alt="Figure 19: Add an instance - Step 4" width="600" height="258" class="size-full wp-image-1125" srcset="/content/uploads/2014/02/Opsworks16.png 600w, /content/uploads/2014/02/Opsworks16-360x154.png 360w, /content/uploads/2014/02/Opsworks16-1x1.png 1w" sizes="(max-width: 600px) 100vw, 600px" />

  <p class="wp-caption-text">
    Figure 19: Add an instance - Step 4
  </p>
</div>

Notice that each layer now has one EC2 instance associated. At this point both instances are still in the _Stopped_ state (See Figure 20). Before we can power them on, we need to define the actual application that is being run.

<div id="attachment_1126" style="width: 610px" class="wp-caption aligncenter">
  <img src="/content/uploads/2014/02/Opsworks17.png" alt="Figure 20: Successfully created instances" width="600" height="353" class="size-full wp-image-1126" srcset="/content/uploads/2014/02/Opsworks17.png 600w, /content/uploads/2014/02/Opsworks17-360x211.png 360w, /content/uploads/2014/02/Opsworks17-1x1.png 1w" sizes="(max-width: 600px) 100vw, 600px" />

  <p class="wp-caption-text">
    Figure 20: Successfully created instances
  </p>
</div>

### Add an App

Next we need to tell AWS OpsWorks which application to run on our stack. This is done by pointing to a source code repository or file bundle. Supported repositories include Github and Subversion. The bundles can be a simple Zip file via a HTTP or HTTPS URL or a ZIP file in a S3 bucket.

Navigate to the _Apps_ tab and click on _Add an app_ (See Figure 21).

<div id="attachment_1127" style="width: 610px" class="wp-caption aligncenter">
  <img src="/content/uploads/2014/02/Opsworks18.png" alt="Figure 21: Add an App - Step 1" width="600" height="122" class="size-full wp-image-1127" srcset="/content/uploads/2014/02/Opsworks18.png 600w, /content/uploads/2014/02/Opsworks18-360x73.png 360w, /content/uploads/2014/02/Opsworks18-1x1.png 1w" sizes="(max-width: 600px) 100vw, 600px" />

  <p class="wp-caption-text">
    Figure 21: Add an App - Step 1
  </p>
</div>

For the case of installing a fresh blank WordPress install you can therefore choose the _Repository type_ to be _Http archive_ and use for the _Repository URL_ the URL _http://wordpress.org/latest.zip_ (See Figure 22). This will allow you to install the latest version of WordPress.

In case you want to restore a backup from the WordPress Backup Plugin BackWPup, you can use Amazon S3 to store the backup files. This will allow you to directly specify this backup file in S3 here. When using BackWPup include the MySQL database as a Zip file inside the Backup file. The Chef recipe for WordPress mentioned above will then automatically import the database dump file back into MySQL.

<div id="attachment_1128" style="width: 514px" class="wp-caption aligncenter">
  <img src="/content/uploads/2014/02/Opsworks19.png" alt="Figure 22: Add an App - Step 2" width="504" height="458" class="size-full wp-image-1128" srcset="/content/uploads/2014/02/Opsworks19.png 504w, /content/uploads/2014/02/Opsworks19-360x327.png 360w, /content/uploads/2014/02/Opsworks19-1x1.png 1w" sizes="(max-width: 504px) 100vw, 504px" />

  <p class="wp-caption-text">
    Figure 22: Add an App - Step 2
  </p>
</div>

This completes the configuration of the app, but also the layers and stack itself. Your new WordPress application is now ready for deployment.

### Deploy your stack

So far we have not created any EC2 instance yet, but only defined Meta data in AWS OpsWorks. In order to actually use the WordPress application, we need to deploy it by starting the layer instances.

Return to the _Instances_ tab and click on _Start All Instances_ (See Figure 23). This will create, boot and configure all instances in all layers. It can take up to 10 minutes for the operation to complete. Therefore please be patient.

<div id="attachment_1129" style="width: 610px" class="wp-caption aligncenter">
  <img src="/content/uploads/2014/02/Opsworks20.png" alt="Figure 23: Start all instances" width="600" height="80" class="size-full wp-image-1129" srcset="/content/uploads/2014/02/Opsworks20.png 600w, /content/uploads/2014/02/Opsworks20-360x48.png 360w, /content/uploads/2014/02/Opsworks20-1x1.png 1w" sizes="(max-width: 600px) 100vw, 600px" />

  <p class="wp-caption-text">
    Figure 23: Start all instances
  </p>
</div>

Once the instances are fully deployed, you'll see the instances to move from the _stopped_ state to the _online_ state. Look up the IP address for the instance in the PHP App Server layer. This IP address should be marked with _EIP_ for Elastic IP (See Figure 24). This is the IP address under which your WordPress installation will be available.

<div id="attachment_1130" style="width: 610px" class="wp-caption aligncenter">
  <img src="/content/uploads/2014/02/Opsworks21.png" alt="Figure 24: All instances are active" width="600" height="350" class="size-full wp-image-1130" srcset="/content/uploads/2014/02/Opsworks21.png 600w, /content/uploads/2014/02/Opsworks21-360x210.png 360w, /content/uploads/2014/02/Opsworks21-1x1.png 1w" sizes="(max-width: 600px) 100vw, 600px" />

  <p class="wp-caption-text">
    Figure 24: All instances are active
  </p>
</div>

Connect with your favorite Web Browser to the IP address that you retrieved in the previous step. Or create a DNS name and connect to the DNS name. You will see your WordPress ready to be used (See Figure 25).

In case of a fresh blank install you start with the basic configuration of the site via the WordPress web interface. If on the other side you re-created the site from a backup, you should find the site running as it was during the backup run.

<div id="attachment_1131" style="width: 610px" class="wp-caption aligncenter">
  <img src="/content/uploads/2014/02/Opsworks22.png" alt="Figure 25: Fully installed WordPress site" width="600" height="462" class="size-full wp-image-1131" srcset="/content/uploads/2014/02/Opsworks22.png 600w, /content/uploads/2014/02/Opsworks22-360x277.png 360w, /content/uploads/2014/02/Opsworks22-1x1.png 1w" sizes="(max-width: 600px) 100vw, 600px" />

  <p class="wp-caption-text">
    Figure 25: Fully installed WordPress site
  </p>
</div>

This completes this guide on using AWS OpsWorks to deploy a fresh blank WordPress install or to recover as WordPress site as part of a Dev/Test or Disaster Recovery (DR) use case.

### Shutdown and Redeploy

You can shutdown instances and restart them if you want to take a break in your work and keep working where you left off.

But in the case you want to keep the stack for disaster recovery purposes, you want the instances to be rebuild with the latest version of your application and database during the recovery. Therefore you will want to discard the EC2 instances while keeping the Elastic IP address.

Therefore first power down all layer instances. Then delete the PHP App Server instance. Make sure to untick the box for _Delete Instance's Elastic IP_ for the PHP App Server instance (See Figure 26). This way you can reuse the Elastic IP address when you spin up new instances again.

<div id="attachment_1151" style="width: 610px" class="wp-caption aligncenter">
  <img src="/content/uploads/2014/02/Opsworks23.png" alt="Figure 26: Keep the Elastic IP when deleting a PHP App Server instance" width="600" height="169" class="size-full wp-image-1151" srcset="/content/uploads/2014/02/Opsworks23.png 600w, /content/uploads/2014/02/Opsworks23-360x101.png 360w, /content/uploads/2014/02/Opsworks23-1x1.png 1w" sizes="(max-width: 600px) 100vw, 600px" />

  <p class="wp-caption-text">
    Figure 26: Keep the Elastic IP when deleting a PHP App Server instance
  </p>
</div>

Next delete the MySQL instance. Here select _Delete instance's EBS volumes_ to delete the current database content (See Figure 27). The database content will be restored as part of the restore process from the backup in the S3 bucket.

<div id="attachment_1152" style="width: 610px" class="wp-caption aligncenter">
  <img src="/content/uploads/2014/02/Opsworks24.png" alt="Figure 27: Delete the instances EBS volume for the MySQL server" width="600" height="170" class="size-full wp-image-1152" srcset="/content/uploads/2014/02/Opsworks24.png 600w, /content/uploads/2014/02/Opsworks24-360x102.png 360w, /content/uploads/2014/02/Opsworks24-1x1.png 1w" sizes="(max-width: 600px) 100vw, 600px" />

  <p class="wp-caption-text">
    Figure 27: Delete the instances EBS volume for the MySQL server
  </p>
</div>

Now recreate the instances as described above.

### References

If you want to find out more about AWS OpsWorks, have a look at the AWS re:Invent 2013 presentation [AWS OpsWorks Documentation](http://www.slideshare.net/AmazonWebServices/zero-to-sixty-aws-opsworks-dmg202-aws-reinvent-2013" target="_blank">Zero to Sixty: AWS OpsWorks (DMG202)</a> or the excellent <a href="https://aws.amazon.com/documentation/opsworks/).
