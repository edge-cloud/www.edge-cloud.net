---
id: 659
title: 'OpenStack with vSphere and NSX - Part 6: Install the VMware vCenter Plugin for Openstack and look behind the scenes'
date: 2014-02-08T10:44:46+00:00
author: Christian Elsen
excerpt: Install the VMware NSX plugin into the vSphere OpenStack Virtual Appliance (VOVA) for a setup including VMware vSphere, VMware NSX and OpenStack.
layout: single
permalink: /2014/02/08/openstack-vsphere-nsx-part-6/
redirect_from:
  - /2014/02/08/openstack-vsphere-nsx-part-6/amp/
image: /wp-content/uploads/2014/01/VC_Plugin_05.png
categories:
  - EdgeCloud
tags:
  - Network
  - NSX
  - OpenStack
  - VMware
---
Welcome to the final part of the [series](https://www.edge-cloud.net/2013/12/12/openstack-vsphere-nsx/ "OpenStack with vSphere and NSX") on installing OpenStack with VMware vSphere and VMware NSX. This series shows the deployment of an OpenStack cloud that leverages VMware vSphere – along with it’s well-known enterprise-class benefits such as VMotion – as the underlying Hypervisor. In addition, network virtualization within OpenStack will be provided via NSX as a Neutron plugin. This allows the creation of virtual networks within OpenStack that consist of L2 segments and can be interconnected via L3 to each other or the outside world.

In the [previous post](https://www.edge-cloud.net/2014/01/24/openstack-vsphere-nsx-part5/ "OpenStack with vSphere and NSX – Part 5: Create virtual networks and launch a VM instance in OpenStack") we took our new cloud for a quick spin and saw what we can do with it, creating virtual networks within OpenStack that consist of L2 segments and interconnecting them via L3 to each other or the outside world. Also we created our first VM instance via the OpenStack Horizon Web Interface.

In this post we will dig a bit deeper and look behind the scenes of our Cloud. First we will configure the VMware vCenter Plugin for OpenStack that provides operators using the vSphere Web Client insight into the OpenStack layer running on top. Next we will explore one of the main benefits of merging the enterprise class vSphere platform with OpenStack, by performing a vMotion operation on a VM that was created via OpenStack. Furthermore we will create a floating IP address in OpenStack and show how to connect to our VM with this IP address. Last but least, we will have a quick glance at the API capabilities of OpenStack.

### Configure the VMware vCenter Plugin for OpenStack

The idea behind the [VMware vCenter Plugin for OpenStack](http://blogs.vmware.com/vsphere/2013/11/vcenter-web-client-plug-in-for-openstack.html) is to provide operators of the virtualization layer insight into the OpenStack layer running on top. This can greatly enhance troubleshooting capabilities, especially for the case that the vSphere virtualization layer and the OpenStack layer are managed by different people or teams.

The VMware vCenter Plugin for OpenStack is part of VOVA and is automatically installed once VOVA is pointed to a vCenter. For some reason it currently doesn't auto-configure itself, but requires manual intervention in the vSphere Web Client. Let's therefore perform this manual configuration:

First you need to lookup the Identity API Endpoint information within your OpenStack deployment. Navigate to the _Project_ view and the _Access & Security_ tab. Under the _API Access_ tab lookup the _Service Endpoint_ for the _Identity_ service (See Figure 1).

<div id="attachment_1067" style="width: 610px" class="wp-caption aligncenter">
  <img src="/content/uploads/2014/01/VC_Plugin_01.png" alt="Figure 1: OpenStack API Endpoint Information" width="600" height="290" class="size-full wp-image-1067" srcset="/content/uploads/2014/01/VC_Plugin_01.png 600w, /content/uploads/2014/01/VC_Plugin_01-360x174.png 360w, /content/uploads/2014/01/VC_Plugin_01-1x1.png 1w" sizes="(max-width: 600px) 100vw, 600px" />

  <p class="wp-caption-text">
    Figure 1: OpenStack API Endpoint Information
  </p>
</div>

Within the vSphere Web Client navigate to the _Administration_ tab (See Figure 2).

<div id="attachment_1068" style="width: 256px" class="wp-caption aligncenter">
  <img src="/content/uploads/2014/01/VC_Plugin_02.png" alt="Figure 2: vSphere Web Client Administration tab" width="246" height="230" class="size-full wp-image-1068" srcset="/content/uploads/2014/01/VC_Plugin_02.png 246w, /content/uploads/2014/01/VC_Plugin_02-1x1.png 1w" sizes="(max-width: 246px) 100vw, 246px" />

  <p class="wp-caption-text">
    Figure 2: vSphere Web Client Administration tab
  </p>
</div>

Next navigate to the _OpenStack_ item in the left-hand navigation tree. Clicking the “+” button on the top of the grid to start the endpoint configuration (See Figure 3).

<div id="attachment_1069" style="width: 610px" class="wp-caption aligncenter">
  <img src="/content/uploads/2014/01/VC_Plugin_03.png" alt="Figure 3: Unconfigured vSphere Web Client Openstack Plugin" width="600" height="401" class="size-full wp-image-1069" srcset="/content/uploads/2014/01/VC_Plugin_03.png 600w, /content/uploads/2014/01/VC_Plugin_03-360x240.png 360w, /content/uploads/2014/01/VC_Plugin_03-1x1.png 1w" sizes="(max-width: 600px) 100vw, 600px" />

  <p class="wp-caption-text">
    Figure 3: Unconfigured vSphere Web Client Openstack Plugin
  </p>
</div>

Configure the _vCenter_ Endpoint first, providing the URL https://vcenter\_ip\_or_fqdn/sdk and the required credentials.

Next configure the _OpenStack_ Keystone Endpoint. Click on the “+” button on the top of the grid, select Keystone and provide the URL - that you have looked up in the previous step - and the required credentials. The URL should look like http://vova\_ip\_or_fqdn:5000/v2.0. In my case the Endpoint configuration proved to be very finicky and random. I had to repeat these steps multiple time until both endpoint showed as Active with a green checkmark (See Figure 4).

<div id="attachment_1070" style="width: 610px" class="wp-caption aligncenter">
  <img src="/content/uploads/2014/01/VC_Plugin_04.png" alt="Figure 4: Fully configured vSphere Web Client Openstack Plugin" width="600" height="254" class="size-full wp-image-1070" srcset="/content/uploads/2014/01/VC_Plugin_04.png 600w, /content/uploads/2014/01/VC_Plugin_04-360x152.png 360w, /content/uploads/2014/01/VC_Plugin_04-1x1.png 1w" sizes="(max-width: 600px) 100vw, 600px" />

  <p class="wp-caption-text">
    Figure 4: Fully configured vSphere Web Client Openstack Plugin
  </p>
</div>

Before you can use the vSphere Web Client OpenStack plugin, you need to logout of the vSphere Web Client and log back in.

Once this has been done you can navigate inside the vSphere Web Client to a VMs summary tab. A new portlet named “OpenStack VM” displays the data properties related to OpenStack instances including the Server name, tenant name of flavor (See Figure 5).

<div id="attachment_1071" style="width: 610px" class="wp-caption aligncenter">
  <img src="/content/uploads/2014/01/VC_Plugin_05.png" alt="Figure 5: Information provided by the vSphere Web Client OpenStack plugin" width="600" height="461" class="size-full wp-image-1071" srcset="/content/uploads/2014/01/VC_Plugin_05.png 600w, /content/uploads/2014/01/VC_Plugin_05-360x276.png 360w, /content/uploads/2014/01/VC_Plugin_05-1x1.png 1w" sizes="(max-width: 600px) 100vw, 600px" />

  <p class="wp-caption-text">
    Figure 5: Information provided by the vSphere Web Client OpenStack plugin
  </p>
</div>

### Perform a VMotion of an OpenStack VM

One of the most heavily used features in VMware vSphere is probably VMotion. Together with the core concept of server virtualization it allows operators to migrate virtual machines within a cluster off a specific hardware host and perform maintenance on this host. This in return leads to a huge increase of uptime for workloads. We will now demonstrate exactly this capability by moving a VM that was created on vSphere via the OpenStack interface from one host to another host. This would allow us to perform maintenance on the physical host without affecting the workloads presented in OpenStack. Let's get started.

Within the vSphere Web Client navigate to a VM that was created via OpenStack. Note down the current host that this VM is running on. Perform a right-click and choose _Migrate..._ (See Figure 6).

<div id="attachment_1062" style="width: 610px" class="wp-caption aligncenter">
  <img src="/content/uploads/2014/01/VC_Manage01.png" alt="Figure 6: Perform a VMotion of an OpenStack VM - Step 1" width="600" height="406" class="size-full wp-image-1062" srcset="/content/uploads/2014/01/VC_Manage01.png 600w, /content/uploads/2014/01/VC_Manage01-360x243.png 360w, /content/uploads/2014/01/VC_Manage01-1x1.png 1w" sizes="(max-width: 600px) 100vw, 600px" />

  <p class="wp-caption-text">
    Figure 6: Perform a VMotion of an OpenStack VM - Step 1
  </p>
</div>

As the migration method choose _Change Host_ in order to move the VM to another host (See Figure 7).

<div id="attachment_1063" style="width: 610px" class="wp-caption aligncenter">
  <img src="/content/uploads/2014/01/VC_Manage02.png" alt="Figure 7: Perform a VMotion of an OpenStack VM - Step 2" width="600" height="195" class="size-full wp-image-1063" srcset="/content/uploads/2014/01/VC_Manage02.png 600w, /content/uploads/2014/01/VC_Manage02-360x117.png 360w, /content/uploads/2014/01/VC_Manage02-1x1.png 1w" sizes="(max-width: 600px) 100vw, 600px" />

  <p class="wp-caption-text">
    Figure 7: Perform a VMotion of an OpenStack VM - Step 2
  </p>
</div>

Select the destination cluster and tick the box for _Allow host selection within this cluster_ in order to pick a specific host (See Figure 8).

<div id="attachment_1064" style="width: 610px" class="wp-caption aligncenter">
  <img src="/content/uploads/2014/01/VC_Manage03.png" alt="Figure 8: Perform a VMotion of an OpenStack VM - Step 3" width="600" height="352" class="size-full wp-image-1064" srcset="/content/uploads/2014/01/VC_Manage03.png 600w, /content/uploads/2014/01/VC_Manage03-360x211.png 360w, /content/uploads/2014/01/VC_Manage03-1x1.png 1w" sizes="(max-width: 600px) 100vw, 600px" />

  <p class="wp-caption-text">
    Figure 8: Perform a VMotion of an OpenStack VM - Step 3
  </p>
</div>

Select the specific host to which you want to migrate the VM (See Figure 9). This host should obviously differ from the initial host.

<div id="attachment_1065" style="width: 610px" class="wp-caption aligncenter">
  <img src="/content/uploads/2014/01/VC_Manage04.png" alt="Figure 9: Perform a VMotion of an OpenStack VM - Step 4" width="600" height="351" class="size-full wp-image-1065" srcset="/content/uploads/2014/01/VC_Manage04.png 600w, /content/uploads/2014/01/VC_Manage04-360x210.png 360w, /content/uploads/2014/01/VC_Manage04-1x1.png 1w" sizes="(max-width: 600px) 100vw, 600px" />

  <p class="wp-caption-text">
    Figure 9: Perform a VMotion of an OpenStack VM - Step 4
  </p>
</div>

Wait for the VMotion to complete successfully. Note that the VM now resided on a different host (See Figure 10).

<div id="attachment_1066" style="width: 610px" class="wp-caption aligncenter">
  <img src="/content/uploads/2014/01/VC_Manage05.png" alt="Figure 10: Perform a VMotion of an OpenStack VM - Step 5" width="600" height="212" class="size-full wp-image-1066" srcset="/content/uploads/2014/01/VC_Manage05.png 600w, /content/uploads/2014/01/VC_Manage05-360x127.png 360w, /content/uploads/2014/01/VC_Manage05-1x1.png 1w" sizes="(max-width: 600px) 100vw, 600px" />

  <p class="wp-caption-text">
    Figure 10: Perform a VMotion of an OpenStack VM - Step 5
  </p>
</div>

You will not notice any difference from within OpenStack about the performed VMotion. In fact, the above operation remains completely invisible and unnoticed from OpenStack, which is exactly what we want.

### Configure a floating IP

Next we will configure a floating IP address for a VM in OpenStack. A floating IP address allows you to reach VMs connected to an internal network from the outside or external network. This is accomplished by OpenStack configuring a Destination NAT (DNAT) rule on the L3 gateway between the external and internal networks.

Within the OpenStack Web interface navigate to the _Project_ view and there pick the _Instances_ tab. Select a VM and click on _More_ within the _Actions_ column. Now select _Associate Floating IP_ (See Figure 11).



<div id="attachment_1072" style="width: 610px" class="wp-caption aligncenter">
  <img src="/content/uploads/2014/01/DNAT01.png" alt="Figure 11: Associate a floating IP in OpenStack - Step 1" width="600" height="332" class="size-full wp-image-1072" srcset="/content/uploads/2014/01/DNAT01.png 600w, /content/uploads/2014/01/DNAT01-360x199.png 360w, /content/uploads/2014/01/DNAT01-1x1.png 1w" sizes="(max-width: 600px) 100vw, 600px" />

  <p class="wp-caption-text">
    Figure 11: Associate a floating IP in OpenStack - Step 1
  </p>
</div>

Initially no floating IP address is available within the project to be used. We therefore need to allocate a new address. For this click on the "+" icon next to the IP address field (See Figure 12).

<div id="attachment_1073" style="width: 610px" class="wp-caption aligncenter">
  <img src="/content/uploads/2014/01/DNAT02.png" alt="Figure 12: Associate a floating IP in OpenStack - Step 2" width="600" height="278" class="size-full wp-image-1073" srcset="/content/uploads/2014/01/DNAT02.png 600w, /content/uploads/2014/01/DNAT02-360x166.png 360w, /content/uploads/2014/01/DNAT02-1x1.png 1w" sizes="(max-width: 600px) 100vw, 600px" />

  <p class="wp-caption-text">
    Figure 12: Associate a floating IP in OpenStack - Step 2
  </p>
</div>

Now select the pool from which you want to select the floating IP address. In this setup only the _External_ pool, which corresponds to the external network is available. Click on _Allocate IP_ to finish the allocation (See Figure 13).

<div id="attachment_1074" style="width: 610px" class="wp-caption aligncenter">
  <img src="/content/uploads/2014/01/DNAT03.png" alt="Figure 13: Associate a floating IP in OpenStack - Step 3" width="600" height="224" class="size-full wp-image-1074" srcset="/content/uploads/2014/01/DNAT03.png 600w, /content/uploads/2014/01/DNAT03-360x134.png 360w, /content/uploads/2014/01/DNAT03-1x1.png 1w" sizes="(max-width: 600px) 100vw, 600px" />

  <p class="wp-caption-text">
    Figure 13: Associate a floating IP in OpenStack - Step 3
  </p>
</div>

Now that an IP address from the External pool has been successfully allocated, it can be associated with the internal IP address of the VM. Click on Associate to finish this association (See Figure 14).

<div id="attachment_1075" style="width: 610px" class="wp-caption aligncenter">
  <img src="/content/uploads/2014/01/DNAT04.png" alt="Figure 14: Associate a floating IP in OpenStack - Step 4" width="600" height="278" class="size-full wp-image-1075" srcset="/content/uploads/2014/01/DNAT04.png 600w, /content/uploads/2014/01/DNAT04-360x166.png 360w, /content/uploads/2014/01/DNAT04-1x1.png 1w" sizes="(max-width: 600px) 100vw, 600px" />

  <p class="wp-caption-text">
    Figure 14: Associate a floating IP in OpenStack - Step 4
  </p>
</div>

The instances view will now display the associated external IP address for the VM besides the internal address (See Figure 15).

In case you would try to connect to this external IP address now, the result would be disappointing: It won't work. That's because the default Security Group settings associated with the VM prevent this access. The idea here is to prevent any kind of external access by default and require users to explicitly grant specific access. Therefore we need to e.g. allow SSH access to the VM, before we can fire up Putty and connect.

<div id="attachment_1076" style="width: 610px" class="wp-caption aligncenter">
  <img src="/content/uploads/2014/01/DNAT05.png" alt="Figure 15: Successfully associate a floating IP in OpenStack" width="600" height="206" class="size-full wp-image-1076" srcset="/content/uploads/2014/01/DNAT05.png 600w, /content/uploads/2014/01/DNAT05-360x123.png 360w, /content/uploads/2014/01/DNAT05-1x1.png 1w" sizes="(max-width: 600px) 100vw, 600px" />

  <p class="wp-caption-text">
    Figure 15: Successfully associate a floating IP in OpenStack
  </p>
</div>

Navigate to the _Access & Security_ tab and select Security Groups. You will find the security group _default_, which is the only security group currently in use. Click on _Edit Rules_ to start editing (See Figure 16).

<div id="attachment_1057" style="width: 610px" class="wp-caption aligncenter">
  <img src="/content/uploads/2014/01/DNAT06.png" alt="Figure 16: Edit Security Groups in OpenStack - Step 1" width="600" height="265" class="size-full wp-image-1057" srcset="/content/uploads/2014/01/DNAT06.png 600w, /content/uploads/2014/01/DNAT06-360x159.png 360w, /content/uploads/2014/01/DNAT06-1x1.png 1w" sizes="(max-width: 600px) 100vw, 600px" />

  <p class="wp-caption-text">
    Figure 16: Edit Security Groups in OpenStack - Step 1
  </p>
</div>

Next click on _Add Rules_ to add a rule for SSH (See Figure 17).

<div id="attachment_1058" style="width: 610px" class="wp-caption aligncenter">
  <img src="/content/uploads/2014/01/DNAT07.png" alt="Figure 17: Edit Security Groups in OpenStack - Step 2" width="600" height="256" class="size-full wp-image-1058" srcset="/content/uploads/2014/01/DNAT07.png 600w, /content/uploads/2014/01/DNAT07-360x153.png 360w, /content/uploads/2014/01/DNAT07-1x1.png 1w" sizes="(max-width: 600px) 100vw, 600px" />

  <p class="wp-caption-text">
    Figure 17: Edit Security Groups in OpenStack - Step 2
  </p>
</div>

As _Rule_ select _SSH_. For _Remote_ select _CIDR_ and for _CIDR_ enter _0.0.0.0/0_. This will allow SSH from anywhere. Click on _Add_ to finalize the wizard. (See Figure 18).

<div id="attachment_1059" style="width: 610px" class="wp-caption aligncenter">
  <img src="/content/uploads/2014/01/DNAT08.png" alt="Figure 18: Edit Security Groups in OpenStack - Step 3" width="600" height="476" class="size-full wp-image-1059" srcset="/content/uploads/2014/01/DNAT08.png 600w, /content/uploads/2014/01/DNAT08-360x285.png 360w, /content/uploads/2014/01/DNAT08-1x1.png 1w" sizes="(max-width: 600px) 100vw, 600px" />

  <p class="wp-caption-text">
    Figure 18: Edit Security Groups in OpenStack - Step 3
  </p>
</div>

Notice the new rule for SSH, which indicates the correct TCP port 22 for SSH (See Figure 19).

<div id="attachment_1060" style="width: 610px" class="wp-caption aligncenter">
  <img src="/content/uploads/2014/01/DNAT09.png" alt="Figure 19: Edit Security Groups in OpenStack - Step 4" width="600" height="92" class="size-full wp-image-1060" srcset="/content/uploads/2014/01/DNAT09.png 600w, /content/uploads/2014/01/DNAT09-360x55.png 360w, /content/uploads/2014/01/DNAT09-1x1.png 1w" sizes="(max-width: 600px) 100vw, 600px" />

  <p class="wp-caption-text">
    Figure 19: Edit Security Groups in OpenStack - Step 4
  </p>
</div>

Now you can use Putty or any other SSH client and successfully connect to the external floating IP address of the VM (See Figure 20).

<div id="attachment_1061" style="width: 610px" class="wp-caption aligncenter">
  <img src="/content/uploads/2014/01/DNAT10.png" alt="Figure 20: Connect via SSH to the floating IP address" width="600" height="410" class="size-full wp-image-1061" srcset="/content/uploads/2014/01/DNAT10.png 600w, /content/uploads/2014/01/DNAT10-360x246.png 360w, /content/uploads/2014/01/DNAT10-1x1.png 1w" sizes="(max-width: 600px) 100vw, 600px" />

  <p class="wp-caption-text">
    Figure 20: Connect via SSH to the floating IP address
  </p>
</div>

### API-driven creation of a VM in OpenStack

One of the big benefits of OpenStack is the simple, yet very powerful API along with various SDK for all kinds of programming languages. Let's use the [Python SDK](http://docs.openstack.org/developer/python-novaclient/) for creating a new VM via the OpenStack API.

Below is a simple Python script, which will connect to your OpenStack cloud, create a new VM and start it.

<pre>import novaclient.v1_1.client as nclient
import time
creds = {"username":"admin",
         "api_key":"VMware1!",
         "project_id":"admin",
         "auth_url":" http://localhost:5000/v2.0/ "
}
print "Booting a debian VM from python..."
nova = nclient.Client(**creds)
print nova.images.list()
image = nova.images.find(name="debian-2.6.32-i686")
print nova.flavors.list()
flavor = nova.flavors.find(name="m1.tiny")
print nova.networks.list()
network = nova.networks.find(label="Internal_Shared")
instance = nova.servers.create(name="created-from-python",image=image, flavor=flavor, nics=[{'net-id': network.id}])
while instance.status != 'ACTIVE':
        print "Waiting for VM... (current status '%s')" % instance.status
        time.sleep(5)
        instance = nova.servers.get(instance.id)
print "VM booted to status '%s'" % instance.status
</pre>

The elements that you need to adapt to your own environment are:

  * username: Your OpenStack username
  * api_key: Your OpenStack password
  * project_id: The name of the project in which the VM should be created.
  * auth_url: Change it to the IP address of your local OpenStack cloud.
  * image: The name of the available image you want to use.
  * flavor: The flavor of the VM you want to use.
  * network: The name of the network to which this VM should get connected to.

You can run this script directly from VOVA. As VOVA is based on [Ubuntu](https://www.ubuntu.com/) you can use the command `sudo apt-get install python-novaclient` to install the required SDK.

### Wrap-Up

Congratulation! We successfully looked behind the scenes into VMware vSphere to see what’s happening during the operation of OpenStack on vSphere. We also installed the VMware vCenter Plugin for Openstack to gain more insight into OpenStack from vSphere, as well as used some of the well-known enterprise-class benefits of vSphere – such as VMotion – along with OpenStack. Furthermore we took a glimpse at how to use OpenStack’s legendary APIs to automate the deployment of a VM. This completes the [series](https://www.edge-cloud.net/2013/12/12/openstack-vsphere-nsx/ "OpenStack with vSphere and NSX") on OpenStack with vSphere and NSX.

If you are at [VMware Partner Exchange (PEX)](https://www.vmworld.com/en/us/programs/partner-exchange.html) from February 10-13 2014, head over to the Hands-On Labs and check out the lab "HOL-SDC-1320 - OpenStack on VMware vSphere" in order to get hands-on experience with the setup described in this setup. After PEX this lab will also become available for general usage within the VMware Hands-On labs.

Also if you want to learn more about using OpenStack with VMware vSphere, have a look at the VMware whitepaper "[Getting Started with OpenStack and VMware vSphere](http://blogs.vmware.com/vsphere/2014/01/getting-started-with-openstack-and-vmware-vsphere-white-paper.html)".
