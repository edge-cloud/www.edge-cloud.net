---
id: 661
title: 'OpenStack with vSphere and NSX &#8211; Part 5: Create virtual networks and launch a VM instance in OpenStack'
date: 2014-01-24T10:26:16+00:00
author: Christian Elsen
excerpt: Create virtual networks and launch a VM instance for a setup including VMware vSphere, VMware NSX and OpenStack.
layout: single
permalink: /2014/01/24/openstack-vsphere-nsx-part5/
redirect_from: 
  - /2014/01/24/openstack-vsphere-nsx-part5/amp/
  - /2014/01/openstack-vsphere-nsx-part5/
image: /wp-content/uploads/2014/01/VOVA01-e1390006518852.png
categories:
  - EdgeCloud
tags:
  - Network
  - NSX
  - OpenStack
  - VMware
---
Welcome to part 5 of the [series](https://www.edge-cloud.net/2013/12/12/openstack-vsphere-nsx/ "OpenStack with vSphere and NSX") on installing OpenStack with VMware vSphere and VMware NSX. This series shows the deployment of an OpenStack cloud that leverages VMware vSphere – along with it’s well-known enterprise-class benefits such as VMotion – as the underlying Hypervisor. In addition, network virtualization within OpenStack will be provided via NSX as a Neutron plugin. This allows the creation of virtual networks within OpenStack that consist of L2 segments and can be interconnected via L3 to each other or the outside world.

In the [previous post](https://www.edge-cloud.net/2014/01/08/openstack-vsphere-nsx-part4/ "OpenStack with vSphere and NSX – Part 4: Import and configure the VMware vSphere OpenStack Virtual Appliance (VOVA)") we completed the import and configuration of the VMware vSphere OpenStack Virtual Appliance (VOVA). In this article we will take our new cloud for a quick spin and see what we can do with it, creating virtual networks within OpenStack that consist of L2 segments and interconnecting them via L3 to each other or the outside world. Also we will create our first VM instance via OpenStack. In the next post we will then dig a bit deeper and look behind the scenes.

### Initial Login to OpenStack

Let&#8217;s start with the initial login into OpenStack via VOVA. Point your preferred browser to the IP address or associated DNS name that you gave VOVA and login with the standard credentials. The username is _admin_ and the password is _vmware_ (See Figure 1).

<div id="attachment_949" style="width: 435px" class="wp-caption aligncenter">
  <img src="/content/uploads/2014/01/VOVA01-e1390006518852.png" alt="Figure 1: Login to OpenStack Horizon" width="425" height="600" class="size-full wp-image-949" />

  <p class="wp-caption-text">
    Figure 1: Login to OpenStack Horizon
  </p>
</div>

After successful login as the user admin you will end up in the admin view of the OpenStack Dashboard Horizon. This is the view that the operator of the OpenStack cloud would see and use (See Figure 2).

<div id="attachment_1044" style="width: 610px" class="wp-caption aligncenter">
  <img src="/content/uploads/2014/01/VOVA02--e1390585711641.png" alt="Figure 2: OpenStack Horizon - Admin View" width="600" height="414" class="size-full wp-image-1044" />

  <p class="wp-caption-text">
    Figure 2: OpenStack Horizon &#8211; Admin View
  </p>
</div>

Let&#8217;s change over to the project view and see what a tenant would see. While the admin account allows you to see both, a regular tenant would only see the project view and not the admin view (See Figure 3).

<div id="attachment_1045" style="width: 610px" class="wp-caption aligncenter">
  <img src="/content/uploads/2014/01/VOVA03--e1390585949340.png" alt="Figure 3: OpenStack Horizon - Project View" width="600" height="329" class="size-full wp-image-1045" />

  <p class="wp-caption-text">
    Figure 3: OpenStack Horizon &#8211; Project View
  </p>
</div>

Next, let&#8217;s have a look at the initial virtual network topology available to us. Click on the _Network Topology_ tab within the Project area (See Figure 4).

<div id="attachment_1040" style="width: 610px" class="wp-caption aligncenter">
  <img src="/content/uploads/2014/01/VOVA-03-e1390585350706.png" alt="Figure 4: Tenant View - Initially empty network topology" width="600" height="330" class="size-full wp-image-1040" />

  <p class="wp-caption-text">
    Figure 4: Tenant View &#8211; Initially empty network topology
  </p>
</div>

Initially the Network Topology is empty. This means that we do not have any network available to connect Virtual Machines to. As this situation is not very useful to us, let&#8217;s start by creating some networks. Here&#8217;s what we need at a base level (See Figure 5):

  1. An external (sometimes also called public) network that corresponds to the physical network segment providing us external connectivity.
  2. An internal network per tenant to which we can attach VMs. These per tenant VM can use this internal network to communicate with each other. But also we don&#8217;t necessarily want to connect every VM to the outside world.
  3. In order for the VMs, connected to the internal network, to reach the outside world (e.g. Internet) we also need a router providing Source NAT (SNAT) capability between internal and external network.

<div id="attachment_1047" style="width: 265px" class="wp-caption aligncenter">
  <img src="/content/uploads/2014/01/OpenStackInternalExternalNetwork.png" alt="Figure 5: Simple Virtual Network for OpenStack" width="255" height="199" class="size-full wp-image-1047" srcset="/content/uploads/2014/01/OpenStackInternalExternalNetwork.png 255w, /content/uploads/2014/01/OpenStackInternalExternalNetwork-1x1.png 1w" sizes="(max-width: 255px) 100vw, 255px" />

  <p class="wp-caption-text">
    Figure 5: Simple Virtual Network for OpenStack
  </p>
</div>

The first component will need to be provided by the cloud operator, while component 2 and 3 are created by the individual tenant. Let&#8217;s therefore consciously split these two jobs into their own sections.

### Creating an external network in OpenStack

As mentioned earlier the cloud operator of the OpenStack cloud will need to create the external network. The _admin_ user that you are currently logged in with has the ability to perform operations as such a cloud operator. But we will later also use it to perform pure tenant operations.

Return to the _Admin_ view, choose the _Networks_ tab and click on _Create Network_ (See Figure 6).

<div id="attachment_1028" style="width: 610px" class="wp-caption aligncenter">
  <img src="/content/uploads/2014/01/VOVA-05-e1390520071274.png" alt="Figure 6: Admin View - Create new network" width="600" height="250" class="size-full wp-image-1028" />

  <p class="wp-caption-text">
    Figure 6: Admin View &#8211; Create new network
  </p>
</div>

Give the new network a useful name such as _External_ and tick the _External Network_ box to designate it as an external network. You need to specify a project when you create a new network. Yet, an external network will be visible from all projects. It therefore doesn&#8217;t really matter which project you assign this network to. A good project to pick is the _service_ project, as it is a core part of OpenStack and therefore won&#8217;t go away. Finalize the creation by clicking on _Create Network_ (See Figure 7).

<div id="attachment_1016" style="width: 610px" class="wp-caption aligncenter">
  <img src="/content/uploads/2014/01/VOVA-06-e1390509043369.png" alt="Figure 7: Create External Network" width="600" height="364" class="size-full wp-image-1016" />

  <p class="wp-caption-text">
    Figure 7: Create External Network
  </p>
</div>

Next click on the network name &#8211; here _External_ &#8211; to configure additional settings such as the subnet (See Figure 8).

<div id="attachment_1017" style="width: 610px" class="wp-caption aligncenter">
  <img src="/content/uploads/2014/01/VOVA-07-e1390509116599.png" alt="Figure 8: Change network settings" width="600" height="114" class="size-full wp-image-1017" />

  <p class="wp-caption-text">
    Figure 8: Change network settings
  </p>
</div>

Within the Network Detail view, click on _Create Subnet_ to associate a subnet with this network (See Figure 9).

<div id="attachment_1018" style="width: 610px" class="wp-caption aligncenter">
  <img src="/content/uploads/2014/01/VOVA-08-e1390509146871.png" alt="Figure 9: Create new subnet" width="600" height="434" class="size-full wp-image-1018" />

  <p class="wp-caption-text">
    Figure 9: Create new subnet
  </p>
</div>

Give the Subnet a meaningful name. I usually use the same name for the Subnet as the Network. Although keep in mind that you can have multiple subnets per network. Furthermore specify the IP range of your external or public network along with the default gateway. In this simple setup, this is the network that all our components (ESXi hosts, vCenter, NSX and VOVA) connect to.

In a realistic, production oriented network, this would be the subnet for the external network that the NSX gateway connects to.

Click on _Subnet Detail_ to continue.

<div id="attachment_1019" style="width: 610px" class="wp-caption aligncenter">
  <img src="/content/uploads/2014/01/VOVA-09-e1390509238631.png" alt="Figure 10: Create Subnet - Step 1" width="600" height="441" class="size-full wp-image-1019" />

  <p class="wp-caption-text">
    Figure 10: Create Subnet &#8211; Step 1
  </p>
</div>

Unselect the _Enable DHCP_ checkbox as this is an external network which either already has an existing DHCP service available, or on which you don&#8217;t want OpenStack to supply DHCP capabilities. Specify the _Allocation pools_ specific to your environment with an IP range that is not already in use within the selected subnet. Specify the _DNS Name Servers_ and click _Create_ to finalize the creation of the subnet (See Figure 11).

<div id="attachment_1020" style="width: 610px" class="wp-caption aligncenter">
  <img src="/content/uploads/2014/01/VOVA-10-e1390509266921.png" alt="Figure 11: Create Subnet - Step 2" width="600" height="428" class="size-full wp-image-1020" />

  <p class="wp-caption-text">
    Figure 11: Create Subnet &#8211; Step 2
  </p>
</div>

Verify that the external network has been successfully created and is in the _UP_ state (See Figure 12).

<div id="attachment_1021" style="width: 610px" class="wp-caption aligncenter">
  <img src="/content/uploads/2014/01/VOVA-11-e1390509293641.png" alt="Figure 12: Successfully created External Network" width="600" height="446" class="size-full wp-image-1021" />

  <p class="wp-caption-text">
    Figure 12: Successfully created External Network
  </p>
</div>

### A tenant&#8217;s view of creating networks

Let&#8217;s return to the tenant&#8217;s view and see how the previously created external network will look like. Choose the _Project_ view, then click on the _Network Topology_ tab. You can see the external network available to the tenant (See Figure 13).

<div id="attachment_1013" style="width: 610px" class="wp-caption aligncenter">
  <img src="/content/uploads/2014/01/VOVA-12-e1390507372328.png" alt="Figure 13: Tenant View - Create internal network" width="600" height="329" class="size-full wp-image-1013" />

  <p class="wp-caption-text">
    Figure 13: Tenant View &#8211; Create internal network
  </p>
</div>

Next we will create the internal network. This task will be completed by the tenant within a project. Therefore still within project view, click on the _Create Networks_ button (See Figure 13).

Enter a useful name as the _Network Name_ and click on the _Subnet_ to specify additional information (See Figure 14).

<div id="attachment_963" style="width: 610px" class="wp-caption aligncenter">
  <img src="/content/uploads/2014/01/VOVA15-e1390006239329.png" alt="Figure 14: Create Network - Step 1" width="600" height="265" class="size-full wp-image-963" />

  <p class="wp-caption-text">
    Figure 14: Create Network &#8211; Step 1
  </p>
</div>

Specify a _Subnet Name_ &#8211; e.g. the value _Internal_ &#8211; along with the _Network Address_. Click on _Subnet Detail_ to continue (See Figure 15).

<div id="attachment_964" style="width: 610px" class="wp-caption aligncenter">
  <img src="/content/uploads/2014/01/VOVA16-e1390006215285.png" alt="Figure 15: Create Network - Step 2" width="600" height="485" class="size-full wp-image-964" />

  <p class="wp-caption-text">
    Figure 15: Create Network &#8211; Step 2
  </p>
</div>

Enter the value of the _DNS Name Server_ and finish the dialog with a click on _Create_ (See Figure 16).

<div id="attachment_965" style="width: 610px" class="wp-caption aligncenter">
  <img src="/content/uploads/2014/01/VOVA17-e1390006190125.png" alt="Figure 16: Create Network - Step 3" width="600" height="428" class="size-full wp-image-965" />

  <p class="wp-caption-text">
    Figure 16: Create Network &#8211; Step 3
  </p>
</div>

The result is now an external network, which was created and is owned by the cloud administrator and an internal network, which was created and is owned by a project tenant.

But we are not done yet: If we connect a workload to the internal network, it will obviously not have outbound connectivity as internal and external network are not connected. We can fix this by creating a router between the two.

Click on _Create Router_ to get started (See Figure 17).

<div id="attachment_966" style="width: 610px" class="wp-caption aligncenter">
  <img src="/content/uploads/2014/01/VOVA18-e1390006166910.png" alt="Figure 17: Network Topology with Internal and External network" width="600" height="353" class="size-full wp-image-966" />

  <p class="wp-caption-text">
    Figure 17: Network Topology with Internal and External network
  </p>
</div>

Give the Router a useful _Router Name_ and finish the creation of the router with a click on _Create Router_ (See Figure 18).

<div id="attachment_967" style="width: 610px" class="wp-caption aligncenter">
  <img src="/content/uploads/2014/01/VOVA19-e1390006136441.png" alt="Figure 18: Create Router dialog" width="600" height="174" class="size-full wp-image-967" />

  <p class="wp-caption-text">
    Figure 18: Create Router dialog
  </p>
</div>

Next we need to create the router&#8217;s interfaces on the two networks. Click on the router and choose _view router details_ to get started (See Figure 19).

<div id="attachment_968" style="width: 610px" class="wp-caption aligncenter">
  <img src="/content/uploads/2014/01/VOVA20-e1390006109227.png" alt="Figure 19: Network Topology with unconnected router" width="600" height="487" class="size-full wp-image-968" />

  <p class="wp-caption-text">
    Figure 19: Network Topology with unconnected router
  </p>
</div>

Now click on _Add Interface_ to add the internal interface first (See Figure 20).

<div id="attachment_969" style="width: 610px" class="wp-caption aligncenter">
  <img src="/content/uploads/2014/01/VOVA21-e1390006086579.png" alt="Figure 20: Router Overview" width="600" height="272" class="size-full wp-image-969" />

  <p class="wp-caption-text">
    Figure 20: Router Overview
  </p>
</div>

As the Subnet choose the internal network that you created in an earlier step (See Figure 21). In case you are tempted to think that it doesn&#8217;t matter which interface we add first: The interface to the external network is an uplink for this router and is therefore added differently. Click on _Add interface_ to finish your selection.

<div id="attachment_970" style="width: 610px" class="wp-caption aligncenter">
  <img src="/content/uploads/2014/01/VOVA22-e1390006054933.png" alt="Figure 21: Add interface to router" width="600" height="350" class="size-full wp-image-970" />

  <p class="wp-caption-text">
    Figure 21: Add interface to router
  </p>
</div>

Notice that the result will include an interface with a fixed address from the subnet that is part of the internal network, but also an interface with an IPv4 link local address (See Figure 22). This special interface and address can be used by VMs in OpenStack to query an API in order to learn more about themselves.

<div id="attachment_972" style="width: 610px" class="wp-caption aligncenter">
  <img src="/content/uploads/2014/01/VOVA24-e1390006042921.png" alt="Figure 22: Router with connection to internal network" width="600" height="353" class="size-full wp-image-972" />

  <p class="wp-caption-text">
    Figure 22: Router with connection to internal network
  </p>
</div>

Next we need to configure the external network as the upstream network. This is done by setting the gateway for the router. For some reason that capability is not available from within the _Router Detail_ view, adding one more step to our setup.

Click on the _Routers_ tab to leave the Router Detail view (See Figure 22).

Under _Actions_ for the router click on _Set Gateway_ (See Figure 23).

<div id="attachment_973" style="width: 610px" class="wp-caption aligncenter">
  <img src="/content/uploads/2014/01/VOVA25-e1390005679472.png" alt="Figure 23: Specify the Router Gateway" width="600" height="142" class="size-full wp-image-973" />

  <p class="wp-caption-text">
    Figure 23: Specify the Router Gateway
  </p>
</div>

As the External Network chose the network that is provided by the cloud operator and confirm the selection by clicking on _Set Gateway_ (See Figure 24).

<div id="attachment_974" style="width: 610px" class="wp-caption aligncenter">
  <img src="/content/uploads/2014/01/VOVA26-e1390005670546.png" alt="Figure 24: Set Router Gateway dialog" width="600" height="293" class="size-full wp-image-974" />

  <p class="wp-caption-text">
    Figure 24: Set Router Gateway dialog
  </p>
</div>

Return to the _Network Topology_ view to see the result (See Figure 25).

<div id="attachment_976" style="width: 610px" class="wp-caption aligncenter">
  <img src="/content/uploads/2014/01/VOVA28-e1390005651780.png" alt="Figure 25: Network Topology with Internal Network, External Network and Router between them" width="600" height="353" class="size-full wp-image-976" />

  <p class="wp-caption-text">
    Figure 25: Network Topology with Internal Network, External Network and Router between them
  </p>
</div>

Finally our virtual network in OpenStack as shown in Figure 5 has been completed and we are ready to deploy our first virtual machine.

### Deploying a Virtual Machine

Now with the network in place, we are finally ready to deploy a first VM in our OpenStack cloud. From the _Network Topology_ tab click on the _Launch Instance_ button (See Figure 25).

Give your new instance a meaningful name as the _Instance Name_ and select an appropriate _Flavor_ &#8211; e.g. m1.tiny. As the _Instance Boot Source_ choose _Boot from image_ and select as the _Image Name_ the image _debian-2.6.32-i686 (1 GB)_, which comes packaged with VOVA. Click on the _Networking_ tab to continue (See Figure 26).

<div id="attachment_977" style="width: 610px" class="wp-caption aligncenter">
  <img src="/content/uploads/2014/01/VOVA29-e1390005641217.png" alt="Figure 26: Launch Instance - Step 1" width="600" height="554" class="size-full wp-image-977" />

  <p class="wp-caption-text">
    Figure 26: Launch Instance &#8211; Step 1
  </p>
</div>

Move the network _Internal_ from the _Available networks_ pool to the _Selected networks_, by either clicking on the plus icon or using drag-and-drop (See Figure 27).

This connect the internal network that we previously created to the first NIC of the new VM instance. Click on _Launch_ to finalize the creation of your VM instance.

<div id="attachment_978" style="width: 610px" class="wp-caption aligncenter">
  <img src="/content/uploads/2014/01/VOVA30-e1390005620926.png" alt="Figure 27: Launch Instance - Step 2" width="600" height="300" class="size-full wp-image-978" />

  <p class="wp-caption-text">
    Figure 27: Launch Instance &#8211; Step 2
  </p>
</div>

Wait for the new VM instance to be created and powered up. Once the Status indicates Active and the Power State shows running, you&#8217;re all set (See Figure 28). The first deployment of a VM instance can take up to a few minutes, as vSphere needs to import the above selected Debian image from VOVA into its local storage. Subsequent deploys will just use a clone of this imported image and are therefore much faster. Click on the name of the VM to see the _Instance Detail_.

<div id="attachment_979" style="width: 610px" class="wp-caption aligncenter">
  <img src="/content/uploads/2014/01/VOVA31-e1389917538230.png" alt="Figure 28: Successful Launch of Instance" width="600" height="198" class="size-full wp-image-979" />

  <p class="wp-caption-text">
    Figure 28: Successful Launch of Instance
  </p>
</div>

You can see information about the running VM instance &#8211; such as the ID, the status or the IP address. Click on the _Console_ tab to connect to the VM (See Figure 29).

<div id="attachment_980" style="width: 348px" class="wp-caption aligncenter">
  <img src="/content/uploads/2014/01/VOVA32-e1389917528313.png" alt="Figure 29: Instance Details" width="338" height="600" class="size-full wp-image-980" />

  <p class="wp-caption-text">
    Figure 29: Instance Details
  </p>
</div>

Via the _Console_ you can access your VM instance. Login with the standard username _root_ and the password _vmware_ to this provided Debian image. Afterwards you can control your VM and e.g. test connectivity by pinging the <a href="https://developers.google.com/speed/public-dns/" target="_blank">Google Public DNS Resolver</a> at 8.8.8.8 (See Figure 30).

<div id="attachment_981" style="width: 610px" class="wp-caption aligncenter">
  <img src="/content/uploads/2014/01/VOVA33-e1389917470547.png" alt="Figure 30: Instance Console" width="600" height="429" class="size-full wp-image-981" />

  <p class="wp-caption-text">
    Figure 30: Instance Console
  </p>
</div>

Congratulations! You have gotten your feet wet using your OpenStack cloud, implementing your first virtual network and attaching a new VM instance to it. All this while leveraging VMware vSphere as the underlying Hypervisor as well as network virtualization provided via VMware NSX as a Neutron plugin.

Next in the [series](https://www.edge-cloud.net/2013/12/12/openstack-vsphere-nsx/ "OpenStack with vSphere and NSX") on OpenStack with vSphere and NSX is [Part 6](https://www.edge-cloud.net/2014/02/08/openstack-vsphere-nsx-part-6/ "OpenStack with vSphere and NSX – Part 6: Install the VMware vCenter Plugin for Openstack and look behind the scenes") where we will look behind the scenes into VMware vSphere to see what&#8217;s happening during the operation of OpenStack on vSphere. We will also install the VMware vCenter Plugin for Openstack to gain more insight into OpenStack from vSphere, as well as use some of the well-known enterprise-class benefits of vSphere &#8211; such as VMotion – along with OpenStack. Furthermore we will see how to use OpenStack&#8217;s legendary APIs to automate the deployment of a VM.
