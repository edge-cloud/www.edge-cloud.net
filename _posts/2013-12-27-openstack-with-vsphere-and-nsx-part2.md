---
id: 651
title: 'OpenStack with vSphere and NSX &#8211; Part 2: Create and configure the VMware NSX cluster'
date: 2013-12-27T08:30:17+00:00
author: Christian Elsen
excerpt: 'Create and configure the VMware NSX cluster  for a setup including VMware vSphere, VMware NSX and OpenStack.'
layout: single
permalink: /2013/12/27/openstack-with-vsphere-and-nsx-part2/
redirect_from: 
  - /2013/12/27/openstack-with-vsphere-and-nsx-part2/amp/
image: /wp-content/uploads/2014/02/GatewayServiceL3-e1391895832634.png
categories:
  - EdgeCloud
tags:
  - Network
  - NSX
  - OpenStack
  - VMware
---
Welcome to part&nbsp;2 of the [series](https://www.edge-cloud.net/2013/12/12/openstack-vsphere-nsx/ "OpenStack with vSphere and NSX") on installing OpenStack with VMware vSphere and VMware NSX. This series shows the deployment of a OpenStack cloud that leverages VMware vSphere – along with it’s well-known enterprise-class benefits such as VMotion – as the underlying Hypervisor. In addition, network virtualization within OpenStack will be provided via NSX as a Neutron plugin. This allows the creation of virtual networks within OpenStack that consist of L2 segments and can be interconnected via L3 to each other or the outside world.

In [Part 1](https://www.edge-cloud.net/2013/12/17/openstack-with-vsphere-and-nsx-part1/ "OpenStack with vSphere and NSX – Part 1: Install and configure the VMware NSX appliances") we finished the installation and basic configuration of the VMware NSX appliances. In this post you will learn how to use the NSX Manager’s web-based GUI to join these parts together and build the basic functionality of an NSX installation consisting of a NSX Cluster, NSX Gateway and NSX Service Node as transport nodes as well as a Transport Zone and a Gateway Service.

### Connect the NSX Manager to the NSX Cluster

Let's start by making the NSX Manager aware of the NSX Cluster to be used. This will allow us in subsequent steps to manage this NSX cluster and add further components.

First login to the NSX Manager with the credentials that were set in the previous post (See Figure 1). By default this would be the username "admin" along with the password "admin".



<div id="attachment_734" style="width: 810px" class="wp-caption aligncenter">
  <img src="/content/uploads/2013/12/NSX-Manager01-e1387325908978.png" alt="Figure 1: Login to NSX Manager" width="800" height="514" class="size-full wp-image-734" />

  <p class="wp-caption-text">
    Figure 1: Login to NSX Manager
  </p>
</div>

After the initial login, NSX Manager will indicate that it is currently not connected to any cluster and therefore not much of any use (See Figure 2). Click on _Add Cluster_ to add the first NSX cluster to the NSX Manager.



<div id="attachment_735" style="width: 810px" class="wp-caption aligncenter">
  <img src="/content/uploads/2013/12/NSX-Manager02-e1387325962816.png" alt="Figure 2: NSX Manager without a cluster" width="800" height="497" class="size-full wp-image-735" />

  <p class="wp-caption-text">
    Figure 2: NSX Manager without a cluster
  </p>
</div>

Provide the IP address along with the access credentials of any node within the NSX cluster (See Figure 3). Remember that in this case we have only a single NSX controller available.



<div id="attachment_737" style="width: 411px" class="wp-caption aligncenter">
  <img src="/content/uploads/2013/12/NSX-Manager03-e1387399969216.png" alt="Figure 3: Connect to NSX Controller Cluster - Step 1" width="401" height="250" class="size-full wp-image-737" />

  <p class="wp-caption-text">
    Figure 3: Connect to NSX Controller Cluster &#8211; Step 1
  </p>
</div>

Next, provide a name for this NSX cluster (See Figure 4).



<div id="attachment_739" style="width: 810px" class="wp-caption aligncenter">
  <img src="/content/uploads/2013/12/NSX-Manager05-e1387397063919.png" alt="Figure 4: Connect to NSX Controller Cluster - Step 2" width="800" height="558" class="size-full wp-image-739" />

  <p class="wp-caption-text">
    Figure 4: Connect to NSX Controller Cluster &#8211; Step 2
  </p>
</div>

Click on _Use This NSX Manager_, to specify the NSX Manager as the syslog collector of this NSX cluster. Leave all other settings as is (See Figure 5). In a production environment you would obviously adapt these settings, but for this setup these settings are just fine.

Complete your selection by clicking on _Configure_.



<div id="attachment_740" style="width: 610px" class="wp-caption aligncenter">
  <img src="/content/uploads/2013/12/NSX-Manager06-e1387400019900.png" alt="Figure 5: Connect to NSX Controller Cluster - Step 3" width="600" height="547" class="size-full wp-image-740" />

  <p class="wp-caption-text">
    Figure 5: Connect to NSX Controller Cluster &#8211; Step 3
  </p>
</div>

You should see the NSX controller cluster successfully added with the Connection status as "Up" (See Figure 6).



<div id="attachment_741" style="width: 810px" class="wp-caption aligncenter">
  <img src="/content/uploads/2013/12/NSX-Manager07-e1387397194804.png" alt="Figure 6: NSX Controller Cluster successfully added" width="800" height="317" class="size-full wp-image-741" />

  <p class="wp-caption-text">
    Figure 6: NSX Controller Cluster successfully added
  </p>
</div>

Going to the NSX Manager Dashboard will show you the NSX Controller without any transport nodes added (See Figure 7).



<div id="attachment_742" style="width: 810px" class="wp-caption aligncenter">
  <img src="/content/uploads/2013/12/NSX-Manager08-e1387397251717.png" alt="Figure 7: NSX Controller Cluster without any Transport Nodes" width="800" height="495" class="size-full wp-image-742" />

  <p class="wp-caption-text">
    Figure 7: NSX Controller Cluster without any Transport Nodes
  </p>
</div>

Keep in mind that a single NSX Manager can manage multiple NSX controller cluster.

**Add a new Transport Zone**

In VMware NSX a transport zone corresponds to the underlying physical network used to interconnect transport nodes (hypervisors, service nodes, gateways). A simple VMware NSX deployment will have a single transport zone that represents the physical network connectivity within the data center. But more complex topologies with multiple networks within and outside the data center are possible via multiple transport zones. Here we will use a single transport zone as all transport nodes connect to the same underlying network.

On the _NSX Manager Dashboard_, within the _Summary of Transport Components_ section, click on _Add_ within the _Zones_ row (See Figure 8).



<div id="attachment_743" style="width: 410px" class="wp-caption aligncenter">
  <img src="/content/uploads/2013/12/NSX-Manager09-e1387400045485.png" alt="Figure 8: Add a new Transport Zone" width="400" height="187" class="size-full wp-image-743" />

  <p class="wp-caption-text">
    Figure 8: Add a new Transport Zone
  </p>
</div>

Give the new transport zone a name (See Figure 9). Click on _Save & View_ to finish the creation of a new transport zone.



<div id="attachment_744" style="width: 333px" class="wp-caption aligncenter">
  <img src="/content/uploads/2013/12/NSX-Manager10.png" alt="Figure 9: Create Transport Zone" width="323" height="274" class="size-full wp-image-744" />

  <p class="wp-caption-text">
    Figure 9: Create Transport Zone
  </p>
</div>

Note down the UUID of the newly created transport zone (See Figure 10). We will need this UUID in a later step to configure the <a href="https://communities.vmware.com/community/vmtn/openstack/" target="_blank">vSphere OpenStack Virtual Appliance (VOVA)</a>.



<div id="attachment_745" style="width: 410px" class="wp-caption aligncenter">
  <img src="/content/uploads/2013/12/NSX-Manager11-e1387400075794.png" alt="Figure 10: UUID of the new Transport Zone" width="400" height="247" class="size-full wp-image-745" />

  <p class="wp-caption-text">
    Figure 10: UUID of the new Transport Zone
  </p>
</div>

### Add a new Gateway node

An NSX Gateway connects logical networks to the data center’s physical network or to physical applications. While the NSX gateway appliance was installed and configured in a previous step, it now needs to be added to the NSX cluster.

Return to the _NSX Manager Dashboard_, within the _Summary of Transport Components_ section, click on _Add_ within the _Gateways_ row (See Figure 11).



<div id="attachment_746" style="width: 410px" class="wp-caption aligncenter">
  <img src="/content/uploads/2013/12/NSX-Manager19-e1387400098377.png" alt="Figure 11: Add a new Gateway" width="400" height="186" class="size-full wp-image-746" />

  <p class="wp-caption-text">
    Figure 11: Add a new Gateway
  </p>
</div>

Confirm that the pre-selected transport type is _Gateway_ (See Figure 12).



<div id="attachment_747" style="width: 807px" class="wp-caption aligncenter">
  <img src="/content/uploads/2013/12/NSX-Manager20.png" alt="Figure 12: Create Gateway - Step 1" width="797" height="500" class="size-full wp-image-747" srcset="/content/uploads/2013/12/NSX-Manager20.png 797w, /content/uploads/2013/12/NSX-Manager20-500x313.png 500w" sizes="(max-width: 797px) 100vw, 797px" />

  <p class="wp-caption-text">
    Figure 12: Create Gateway &#8211; Step 1
  </p>
</div>

Give the gateway node a name (See Figure 13). I usually pick the hostname.



<div id="attachment_748" style="width: 710px" class="wp-caption aligncenter">
  <img src="/content/uploads/2013/12/NSX-Manager21-e1387400125148.png" alt="Figure 13: Create Gateway - Step 2" width="700" height="439" class="size-full wp-image-748" />

  <p class="wp-caption-text">
    Figure 13: Create Gateway &#8211; Step 2
  </p>
</div>

Here leave the settings as is (See Figure 14). A _Management Rendezvous Client_ would be necessary if NSX Controller and NSX Gateway do not have direct network connectivity, the _Tunnel Keep-alive Spray_ would randomize TCP source ports for STT tunnel keep-alives for packet spray across active network path and _VTEP enabled_ would be for physical NSX gateways as e.g. offered by <a href="https://www.arista.com/en/company/news/press-release/614-pr-20130826-01" target="_blank">Arista EOS</a>. As none of this applies here, we will stick to the default settings.



<div id="attachment_749" style="width: 805px" class="wp-caption aligncenter">
  <img src="/content/uploads/2013/12/NSX-Manager22.png" alt="Figure 14: Create Gateway - Step 3" width="795" height="499" class="size-full wp-image-749" srcset="/content/uploads/2013/12/NSX-Manager22.png 795w, /content/uploads/2013/12/NSX-Manager22-500x313.png 500w" sizes="(max-width: 795px) 100vw, 795px" />

  <p class="wp-caption-text">
    Figure 14: Create Gateway &#8211; Step 3
  </p>
</div>

Before we can complete the next step, we need to extract the SSL certificate from the NSX gateway appliance. To do so, connect via SSH or console to the NSX gateway appliance and login with the previously defined password and the username _admin_. Use the command `show switch certificate` to display the required certificate (See Figure 15).



<div id="attachment_750" style="width: 610px" class="wp-caption aligncenter">
  <img src="/content/uploads/2013/12/NSX-Manager23-e1387400150281.png" alt="Figure 15: Extract NSX Gateway certificate - Step 1" width="600" height="149" class="size-full wp-image-750" />

  <p class="wp-caption-text">
    Figure 15: Extract NSX Gateway certificate &#8211; Step 1
  </p>
</div>

Copy the certificate including the lines _&#8212;&#8211;BEGIN CERTIFICATE&#8212;&#8211;_ and _&#8212;&#8211;END CERTIFICATE&#8212;&#8211;_ (See Figure 16). We will need this certificate in the next step.



<div id="attachment_751" style="width: 610px" class="wp-caption aligncenter">
  <img src="/content/uploads/2013/12/NSX-Manager24-e1387400170881.png" alt="Figure 16: Extract NSX Gateway certificate - Step 2" width="600" height="372" class="size-full wp-image-751" />

  <p class="wp-caption-text">
    Figure 16: Extract NSX Gateway certificate &#8211; Step 2
  </p>
</div>

Back in the **NSX Manager** select the _Credential Type_ of _Security Certificate_ and paste the previously copied certificate into the _Security Certificate_ field (See Figure 17).



<div id="attachment_752" style="width: 710px" class="wp-caption aligncenter">
  <img src="/content/uploads/2013/12/NSX-Manager25-e1387400193723.png" alt="Figure 17: Create Gateway – Step 4" width="700" height="438" class="size-full wp-image-752" />

  <p class="wp-caption-text">
    Figure 17: Create Gateway – Step 4
  </p>
</div>

Next, we need to create a transport connector for the NSX Gateway. A transport connector does two things:

  * It specifies the transport type or tunnel protocol to be used by the transport node. This transport type has to match for nodes to be able to form an overlay tunnel and communicate.
  * It maps the (physical) interface of a transport node to a transport zone. With this it would be possible to use a single transport node (e.g. gateway) in multiple transport zones.

We will use STT as the transport type in this setup. And remember that we are only using a single transport zone.

Let's get started by clicking on _Add Connector_ (See Figure 18).



<div id="attachment_753" style="width: 710px" class="wp-caption aligncenter">
  <img src="/content/uploads/2013/12/NSX-Manager26-e1387400234672.png" alt="Figure 18: Create Gateway – Step 5" width="700" height="440" class="size-full wp-image-753" />

  <p class="wp-caption-text">
    Figure 18: Create Gateway – Step 5
  </p>
</div>

Select _STT_ as the _Transport Type_, ensure that the _Transport Zone UUID_ matches our single transport zone and enter the IP address of the NSX gateway as the _IP address_ (See Figure 19).



<div id="attachment_754" style="width: 410px" class="wp-caption aligncenter">
  <img src="/content/uploads/2013/12/NSX-Manager27-e1387400251797.png" alt="Figure 19: Create Gateway – Step 6" width="400" height="265" class="size-full wp-image-754" />

  <p class="wp-caption-text">
    Figure 19: Create Gateway – Step 6
  </p>
</div>

This concludes the setup of the NSX Gateway in NSX Manager. Click on _Save_ to finish the configuration (See Figure 20).



<div id="attachment_755" style="width: 710px" class="wp-caption aligncenter">
  <img src="/content/uploads/2013/12/NSX-Manager28-e1387400269998.png" alt="Figure 20: Create Gateway – Step 7" width="700" height="441" class="size-full wp-image-755" />

  <p class="wp-caption-text">
    Figure 20: Create Gateway – Step 7
  </p>
</div>

Return to the _NSX Manager Dashboard_, where you will see the new Gateway within the _Summary of Transport Components_ section, within the _Gateways_ row. Click on the number for active gateways to see more details (See Figure 21).



<div id="attachment_756" style="width: 410px" class="wp-caption aligncenter">
  <img src="/content/uploads/2013/12/NSX-Manager29-e1387400291351.png" alt="Figure 21: NSX Gateway successfully added" width="400" height="186" class="size-full wp-image-756" />

  <p class="wp-caption-text">
    Figure 21: NSX Gateway successfully added
  </p>
</div>

You should see the NSX gateway successfully added with the Connection status as “Up” (See Figure 22).



<div id="attachment_757" style="width: 810px" class="wp-caption aligncenter">
  <img src="/content/uploads/2013/12/NSX-Manager30-e1387398765956.png" alt="Figure 22: NSX Gateway displaying status of &quot;Connected&quot;" width="800" height="141" class="size-full wp-image-757" />

  <p class="wp-caption-text">
    Figure 22: NSX Gateway displaying status of "Connected"
  </p>
</div>

### Add a new Service node

NSX Service Nodes offload network packet processing from hypervisor Open vSwitches, such as broadcast, unknown unicast and multicast (BUM) replication and CPU-intensive cryptographic processing. While the NSX service node appliance was installed and configured in a previous step, it now needs to be added to the NSX cluster.

Return to the _NSX Manager Dashboard_, within the _Summary of Transport Components_ section, click on _Add_ within the _Service Nodes_ row (See Figure 23).



<div id="attachment_758" style="width: 410px" class="wp-caption aligncenter">
  <img src="/content/uploads/2013/12/NSX-Manager31-e1387400322158.png" alt="Figure 23: Add a new Service Node" width="400" height="192" class="size-full wp-image-758" />

  <p class="wp-caption-text">
    Figure 23: Add a new Service Node
  </p>
</div>

Confirm that the pre-selected transport type is **Service Node** (See Figure 24).



<div id="attachment_759" style="width: 710px" class="wp-caption aligncenter">
  <img src="/content/uploads/2013/12/NSX-Manager32-e1387400339217.png" alt="Figure 24: Create Service Node - Step 1" width="700" height="440" class="size-full wp-image-759" />

  <p class="wp-caption-text">
    Figure 24: Create Service Node &#8211; Step 1
  </p>
</div>

The rest of the dialog and workflow for adding the service node is equivalent to what we have already seen while adding the gateway node:

  * Specify the _Display Name_
  * Extract the SSL certificate from the NSX service node appliance
  * Paste the SSL certificate into the add dialog
  * Specify a transport connector with the type _STT_ and the IP address of the service node

We will therefore skip ahead to the result.

Return to the NSX Manager Dashboard, where you will see the new service node within the Summary of Transport Components section, under the Service Nodes row (See Figure 25).



<div id="attachment_764" style="width: 410px" class="wp-caption aligncenter">
  <img src="/content/uploads/2013/12/NSX-Manager37-e1387400416959.png" alt="Figure 25: NSX Service Node successfully added" width="400" height="190" class="size-full wp-image-764" />

  <p class="wp-caption-text">
    Figure 25: NSX Service Node successfully added
  </p>
</div>

### Add a new Gateway Service

A Gateway node by itself does not yet offer any functionality. For that we need to configure a gateway service that will leverage the gateway node. Two types of gateway services exist in VMware NSX:

  * Layer 2 (L2) Gateway Services &#8211; allows VMs to be connected at Layer 2 (L2) to an external network
  * Layer 3 (L3) Gateway Services &#8211; lets you connect logical router ports to physical IP networks via network interfaces on NSX Gateway nodes

We will configure a L3 Gateway Service (See Figure 26).



<div id="attachment_1097" style="width: 310px" class="wp-caption aligncenter">
  <img src="/content/uploads/2014/02/GatewayServiceL3-e1391895832634.png" alt="Figure 26: Layer 3 (L3) Gateway Service" width="300" height="239" class="size-full wp-image-1097" />

  <p class="wp-caption-text">
    Figure 26: Layer 3 (L3) Gateway Service
  </p>
</div>

Return to the _NSX Manager Dashboard_, within the _Summary of Transport Components_ section, click on _Add_ within the Gateway Services row (See Figure 27).



<div id="attachment_765" style="width: 410px" class="wp-caption aligncenter">
  <img src="/content/uploads/2013/12/NSX-Manager41-e1387400443855.png" alt="Figure 27: Add a new Gateway Service" width="400" height="192" class="size-full wp-image-765" />

  <p class="wp-caption-text">
    Figure 27: Add a new Gateway Service
  </p>
</div>

Select _L3 Gateway Service_ as the _Gateway Service Type_ (See Figure 28).



<div id="attachment_766" style="width: 710px" class="wp-caption aligncenter">
  <img src="/content/uploads/2013/12/NSX-Manager42-e1387400466365.png" alt="Figure 28: Create Gateway Service - Step 1" width="700" height="316" class="size-full wp-image-766" />

  <p class="wp-caption-text">
    Figure 28: Create Gateway Service &#8211; Step 1
  </p>
</div>

Enter a name for the newly created gateway service (See Figure 29).



<div id="attachment_767" style="width: 710px" class="wp-caption aligncenter">
  <img src="/content/uploads/2013/12/NSX-Manager43-e1387400495446.png" alt="Figure 29: Create Gateway Service - Step 2" width="700" height="316" class="size-full wp-image-767" />

  <p class="wp-caption-text">
    Figure 29: Create Gateway Service &#8211; Step 2
  </p>
</div>

Now we need to specify the gateway node that will execute this gateway service. Start by clicking on _Add Gateway_ (See Figure 30).



<div id="attachment_768" style="width: 710px" class="wp-caption aligncenter">
  <img src="/content/uploads/2013/12/NSX-Manager44-e1387400508845.png" alt="Figure 30: Create Gateway Service - Step 3" width="700" height="316" class="size-full wp-image-768" />

  <p class="wp-caption-text">
    Figure 30: Create Gateway Service &#8211; Step 3
  </p>
</div>

Select the gateway node that was previously created as well as _breth0_ for the _Device ID_. The device ID is the interface on the NSX gateway node that connects to the external (upstream) network (See Figure 31).



<div id="attachment_769" style="width: 410px" class="wp-caption aligncenter">
  <img src="/content/uploads/2013/12/NSX-Manager45-e1387400523288.png" alt="Figure 31: Create Gateway Service - Step 4" width="400" height="308" class="size-full wp-image-769" />

  <p class="wp-caption-text">
    Figure 31: Create Gateway Service &#8211; Step 4
  </p>
</div>

Verify your Gateway node configuration and finish the installation of the gateway service by clicking on _Save & View_ (See Figure 32).



<div id="attachment_770" style="width: 710px" class="wp-caption aligncenter">
  <img src="/content/uploads/2013/12/NSX-Manager46-e1387400540432.png" alt="Figure 32: Create Gateway Service - Step 5" width="700" height="315" class="size-full wp-image-770" />

  <p class="wp-caption-text">
    Figure 32: Create Gateway Service &#8211; Step 5
  </p>
</div>

Note down the UUID of the newly created gateway zone (See Figure 33). We will need this UUID along with the UUID of the transport zone in a later step to configure the <a href="https://communities.vmware.com/community/vmtn/openstack/" target="_blank">vSphere OpenStack Virtual Appliance (VOVA)</a>.



<div id="attachment_771" style="width: 610px" class="wp-caption aligncenter">
  <img src="/content/uploads/2013/12/NSX-Manager46b-e1387400563398.png" alt="Figure 33: UUID of NSX Gateway Service" width="600" height="276" class="size-full wp-image-771" />

  <p class="wp-caption-text">
    Figure 33: UUID of NSX Gateway Service
  </p>
</div>

Return to the NSX Manager Dashboard, where you will see the new Gateway Zone within the Summary of Transport Components section, within the Gateway Zones row (See Figure 34).



<div id="attachment_772" style="width: 410px" class="wp-caption aligncenter">
  <img src="/content/uploads/2013/12/NSX-Manager47-e1387400657300.png" alt="Figure 34: NSX Setup with Gateway, Service Node, Transport Zone and Gateway Services" width="400" height="197" class="size-full wp-image-772" />

  <p class="wp-caption-text">
    Figure 34: NSX Setup with Gateway, Service Node, Transport Zone and Gateway Services
  </p>
</div>

This completes the basic configuration of the NSX cluster via the NSX Manager. Next in the [series on OpenStack with vSphere and NSX](https://www.edge-cloud.net/2013/12/12/openstack-vsphere-nsx/ "OpenStack with vSphere and NSX") is Part 3 with the [installation and configuration of the Open vSwitch](https://www.edge-cloud.net/2014/01/03/openstack-with-vsphere-and-nsx-part3/ "OpenStack with vSphere and NSX – Part 3: Install and configure the Open vSwitch inside the ESXi hosts") inside the ESXi hosts. While we finished adding the NSX gateway and NSX service node to the NSX cluster in this post, the next post will show how to add the two ESX hypervisor to the NSX cluster. This is done by installation and configuration of the Open vSwitch inside ESX.
