---
id: 631
title: OpenStack with vSphere and NSX
date: 2013-12-12T16:12:27+00:00
author: Christian Elsen
excerpt: 'Introduction to a series explaining how to use VMware vSphere with VMware NSX and OpenStack. '
layout: single
permalink: /2013/12/12/openstack-vsphere-nsx/
redirect_from: 
  - /2013/12/12/openstack-vsphere-nsx/amp/
  - /2013/12/openstack-vsphere-nsx/
image: /wp-content/uploads/2014/02/VOVA+ESXi+NSX.png
categories:
  - EdgeCloud
tags:
  - Network
  - NSX
  - OpenStack
  - VMware
---
In a previous post I have already written about [Physical networks for VMware NSX](https://www.edge-cloud.net/2013/09/04/physical-networks-for-vmware-nsx/). Now it's time to put everything together and showcase you how VMware vSphere, VMware NSX and OpenStack come together for a cloud with network virtualization via overlay networks.

As this includes quite a few steps, I'll split the posts into a series with this one serving as the introduction.

### Goal

The goal of this series will be to deploy an OpenStack cloud that leverages VMware vSphere - along with its well-known enterprise-class benefits such as VMotion - as the underlying Hypervisor. In addition, network virtualization within OpenStack will be provided via VMware NSX as a Neutron plugin. This allows the creation of virtual networks within OpenStack that consist of L2 segments and can be interconnected via L3 to each other or the outside world (See Figure 1).

<div id="attachment_1095" style="width: 610px" class="wp-caption aligncenter">
  <img src="/content/uploads/2014/02/VOVA+ESXi+NSX.png" alt="Figure 1: Logical Setup of an OpenStack cloud, leveraging VMware vSphere and VMware NSX." width="600" height="406" class="size-full wp-image-1095" srcset="/content/uploads/2014/02/VOVA+ESXi+NSX.png 600w, /content/uploads/2014/02/VOVA+ESXi+NSX-360x243.png 360w, /content/uploads/2014/02/VOVA+ESXi+NSX-1x1.png 1w" sizes="(max-width: 600px) 100vw, 600px" />

  <p class="wp-caption-text">
    Figure 1: Logical Setup of an OpenStack cloud, leveraging VMware vSphere and VMware NSX.
  </p>
</div>

In summary we will end up with:

  * VMware vSphere 5.5 cluster serving as Hypervisors for our cloud. Well-known features such as VMotion, HA or DRS will still be usable.
  * VMware NSX for network virtualization, allowing us to create multiple isolated L2 segments per tenant and providing the ability to interconnect them between each other and with the outside world via L3 services.
  * OpenStack as the Cloud Management System (CMS) providing users a well-known interface via a web-based GUI and easy-to-use API as the frontend of our cloud.

### Benefits

One might wonder why to choose VMware vSphere as the Hypervisor of choice for such a setup and not use e.g. KVM instead. Two main reasons come to mind, why the presented architecture is a viable solution:

  1. Usage of Enterprise-class features  
    Using VMware vSphere with OpenStack will present the entire cluster as a single "node" to OpenStack, allowing Administrators to rely on well-known enterprise class features of the VMware vSphere Hypervisor. This includes e.g. Dynamic Resource Scheduling (DRS) to better distribute the workload across Hypervisors, VMotion to free up a Hypervisor in order to perform preventive maintenance or High Availability (HA) to restart workloads in case of hardware failures.  
    The predominant model for cloud computing assumes that all components can fail at any time. Thus the application within the workloads need to ensure redundancy. Using VMware vSphere as the Hypervisor of choice with OpenStack, one can deviate from this model and offer a highly reliable cloud instead, known from managed service provider offerings using virtualization today. But it's also possible to create a hybrid approach, offering both a pure cloud experience as well as a highly available experience within the same cloud.  
    &nbsp;
  2. Ease of deploying VMware vSphere vs Openstack with KVM  
    Deploying OpenStack with KVM is not easy. Instead it is quite a challenging task, which is why various companies - such as e.g. [hands-on labs](https://www.mirantis.com/" title="Mirantis" target="_blank">Mirantis</a> - try to fill this void and offer deployment services or products for OpenStack installation. Deploying a VMware vSphere cluster on the other hand is pretty simple and there are numerous [books](http://amzn.to/2eF0rgc), <a href="http://labs.hol.vmware.com/) or other forms of documentation out there to help. Thus using VMware vSphere as your Hypervisor of choice greatly simplifies the deployment of OpenStack.  
    We will later also see [vSphere OpenStack Virtual Appliance (VOVA)](https://communities.vmware.com/community/vmtn/openstack/). VOVA is an appliance that was built to simplify OpenStack deployment into a VMware vSphere environment for test, proof-of-concept and education purposes. VOVA runs all of the required OpenStack services (Nova, Glance, Cinder, Neutron, Keystone, and Horizon) in a single Ubuntu Linux appliance.

### Setup

Please remember that this setup is for test, proof-of-concept and education purposes only. Do not use this in production and do not use any production element in it.

For this setup we will assume the following prerequisites are already in place:

  * VMware vSphere cluster
      * Version 5.5 or higher.
      * vCenter can either be on Windows or as VMware vCenter Server Appliance (VCSA). I will use VCSA.
      * At least one free vmnic for binding the NSX vSwitch
      * A single "Datacenter" should be configured in vCenter (This is a temporary limitation as safety precaution).
      * DRS should enabled with "Fully automated" placement turned on.
      * The cluster should have only Datastores that are shared among all hosts in the cluster. It is recommended to use a single shared datastore for the cluster.

As part of this walk-through series, we will add the following components:

  * VMware NSX cluster
      * A single NSX Controller. Note that VMware NSX requires three or five NSX controller deployed as a cluster on physical hardware in a production environment. As this setup is for test, proof-of-concept and education purposes only, it is sufficient to deploy a single controller inside a VM.
      * A NSX Manager instance inside a VM.
      * A NSX service node instance inside a VM.
      * A NSX gateway instance inside a VM.
  * vSphere OpenStack Virtual Appliance (VOVA)
      * A single instance of the [vSphere OpenStack Virtual Appliance (VOVA)](https://communities.vmware.com/community/vmtn/openstack/).

The resulting setup will look like Figure 2.

<div id="attachment_713" style="width: 1032px" class="wp-caption aligncenter">
  <img src="/content/uploads/2013/12/vPod-VOVA-Version2.png" alt="Figure 2: Physical Setup of an OpenStack cloud, leveraging VMware vSphere and VMware NSX." width="1022" height="345" class="size-full wp-image-713" srcset="/content/uploads/2013/12/vPod-VOVA-Version2.png 1022w, /content/uploads/2013/12/vPod-VOVA-Version2-500x168.png 500w" sizes="(max-width: 1022px) 100vw, 1022px" />

  <p class="wp-caption-text">
    Figure 2: Physical Setup of an OpenStack cloud, leveraging VMware vSphere and VMware NSX.
  </p>
</div>

In this setup we will use a very simple physical network setup. All components will attach to a common Mgmt / VM Network. Only Storage (iSCSI/NFS) and vMotion will use dedicated isolated networks (e.g. VLAN) according to VMware vSphere best practices. As indicated in Figure 2, the Hypervisors as well as the NSX Controller, NSX Gateway and NSX Service Node will form an overlay network via STT tunnels. Please do not use such a simple network setup, sharing management and tenant traffic on the same network segment, in a production environment!

### Steps

The required installation and configuration steps include:

  1. [Install and configure the VMware NSX appliances](https://www.edge-cloud.net/2013/12/17/openstack-with-vsphere-and-nsx-part1/ "OpenStack with vSphere and NSX – Part 1: Install and configure the VMware NSX appliances")
  2. [Create and configure the VMware NSX cluster](https://www.edge-cloud.net/2013/12/27/openstack-with-vsphere-and-nsx-part2/ "OpenStack with vSphere and NSX – Part 2: Create and configure the VMware NSX cluster")
  3. [Install and configure the Open vSwitch inside the ESXi hosts](https://www.edge-cloud.net/2014/01/03/openstack-with-vsphere-and-nsx-part3/ "OpenStack with vSphere and NSX – Part 3: Install and configure the Open vSwitch inside the ESXi hosts")
  4. [Import and configure the VMware vSphere OpenStack Virtual Appliance (VOVA)](https://www.edge-cloud.net/2014/01/08/openstack-vsphere-nsx-part4/ "OpenStack with vSphere and NSX – Part 4: Import and configure the VMware vSphere OpenStack Virtual Appliance (VOVA)")
  5. [Create virtual networks and launch a VM instance in OpenStack](https://www.edge-cloud.net/2014/01/24/openstack-vsphere-nsx-part5/ "OpenStack with vSphere and NSX – Part 5: Create virtual networks and launch a VM instance in OpenStack")
  6. [Configure the VMware vCenter Plugin for Openstack and look behind the scenes of OpenStack on vSphere](https://www.edge-cloud.net/2014/02/08/openstack-vsphere-nsx-part-6/ "OpenStack with vSphere and NSX – Part 6: Install the VMware vCenter Plugin for Openstack and look behind the scenes")
