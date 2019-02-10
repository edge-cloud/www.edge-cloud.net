---
id: 564
title: Jumbo Frames with VMware ESXi
date: 2013-11-11T11:11:09+00:00
author: Christian Elsen
excerpt: Using Jumbo Frames with ESXi reduces CPU overhead and gives you much higher performance with 10 GigE. This article shows you how to enable Jumbo Frames with vSphere 5.1 or higher.
layout: single
permalink: /2013/11/11/jumbo-frames-vmware-esxi/
redirect_from: 
  - /2013/11/11/jumbo-frames-vmware-esxi/amp/
  - /2013/11/jumbo-frames-vmware-esxi/
image: /wp-content/uploads/2013/11/JumboFrames.png
categories:
  - EdgeCloud
tags:
  - VMware
---
Ethernet's default maximum size for data transmission is 1500 bytes due to legacy compatibility reasons. Unfortunately with newer high-speed networks - such as 10 Gigabit Ethernet (10 GigE) - breaking up data into chunks of 1500 bytes - also called frames - creates a lot of overhead with a high header to payload ratio. This not only creates a higher than necessary overhead on the Hypervisor's CPU, but also prevents one from utilizing the full capabilities of the network hardware. For example: On a 10Gbit link it is possible that you will only be able to transmit about 3-4 Gbps of data between machines using 1500 byte frames, while you can easily saturate 10Gbit when using jumbo frames.

### Background

Modern full-featured network equipment can transmit larger frame sizes if configured to do so, usually up to a value of at least 9000 bytes. Even though almost every vendor of network equipment has a different maximum value of what their products can be configured with for MTU, it is recommended to stick to a MTU of 9000 bytes for Jumbo Frames. This value is easy to remember and all network products that support Jumbo frames usually support at least this value.

Jumbo frames should only used in a controlled and segmented environment, for example within an iSCSI or NFS SAN, as they can cause additional overhead from the need for packet fragmentation at the point when converting between a 9000 byte frame network and a standard 1500 byte frame network.

### Goal

One of the main use case for Jumbo Frames within VMware vSphere is between an ESXi host and an iSCSI or NFS storage array. Another common use case is between ESXi hosts for VMotion traffic. While this post focuses on the former use case, it is easily transferable to the later.

VMware ESXi uses so-called VMkernel ports to connect the Hypervisor to a storage array. You can think of this port as the Hypervisor kernel's equivalent to a vNIC for Virtual Machines. In order to use Jumbo Frames between the Hypervisor and the storage array, all elements in between need to be configured for at least the desired MTU size - here 9000. (See Figure 1).

<div id="attachment_567" style="width: 522px" class="wp-caption aligncenter">
  <img src="/content/uploads/2013/11/JumboFrames.png" alt="Figure 1: Jumbo Frames for storage arrays with VMware ESXi" width="512" height="257" class="size-full wp-image-567" srcset="/content/uploads/2013/11/JumboFrames.png 512w, /content/uploads/2013/11/JumboFrames-500x250.png 500w" sizes="(max-width: 512px) 100vw, 512px" />

  <p class="wp-caption-text">
    Figure 1: Jumbo Frames for storage arrays with VMware ESXi
  </p>
</div>

This includes the physical storage array, the physical switch, potentially the physical server (e.g. for the Cisco UCS, where this server includes networking capabilities), the VMware Virtual Switch (both default vSwitch and Distributed vSwitch) and last but not least the VMkernel port itself.

It is important to note that the network elements only need to be configured for _at least_ the desired MTU size. If the MTU size ends up being higher, it will not impact functionality. As an example: The [Arista Networks](https://www.arista.com/en/) switches have a default MTU size of 9216 bytes, which can remain as is. No need to make any changes here.

I'll leave the exercise of figuring out how to configure your physical equipment to a MTU size of 9000 to you. Unfortunately almost every vendor has a different approach for achieving this.

### Configuring ESXi

Support for jumbo frames has been included in ESX and ESXi for quite a while. But up until version 5.0 of vSphere is was not exposed in the GUI for both the default vSwitch and Distributed vSwitch implementation. It had to be configured via the ESX CLI for a default vSwitch and VMkernel port. Since vSphere 5.1 it is possible to configure the MTU settings via the GUI for all three elements.

Keeping in mind Figure, we will need to change the MTU settings both for the virtual Switch (irrespective of whether this is a default vSwitch or a Distributed vSwitch) and the VMKernel port.

### Default vSwitch

For the Default vSwitch navigate to host to which this vSwitch belongs to and choose _Manage -> Networking -> Virtual Switches -> Name of Virtual Switch -> Edit_. (See Figure 2).

<div id="attachment_568" style="width: 892px" class="wp-caption aligncenter">
  <img src="/content/uploads/2013/11/Capture10.png" alt="Figure 2: Jumbo Frames in Default vSwitches" width="882" height="559" class="size-full wp-image-568" srcset="/content/uploads/2013/11/Capture10.png 882w, /content/uploads/2013/11/Capture10-500x316.png 500w" sizes="(max-width: 882px) 100vw, 882px" />

  <p class="wp-caption-text">
    Figure 2: Jumbo Frames in Default vSwitches
  </p>
</div>

Next change the _MTU (Bytes)_ setting to 9000 under Properties and confirm your choice with a click on _OK_. (See Figure 3)

<div id="attachment_569" style="width: 974px" class="wp-caption aligncenter">
  <img src="/content/uploads/2013/11/Capture04.png" alt="Figure 3: Changing MTU settings for a Default vSwitch" width="964" height="563" class="size-full wp-image-569" srcset="/content/uploads/2013/11/Capture04.png 964w, /content/uploads/2013/11/Capture04-500x292.png 500w" sizes="(max-width: 964px) 100vw, 964px" />

  <p class="wp-caption-text">
    Figure 3: Changing MTU settings for a Default vSwitch
  </p>
</div>

You will have to repeat these steps for all Default vSwitches on all your hosts that you want to leverage Jumbo Frames on.

### Distributed vSwitch

To change the MTU settings of a Distributed vSwitch navigate to the desired vDS. Next choose _Manage -> Settings -> Properties -> Edit_. (See Figure 4).

<div id="attachment_571" style="width: 1127px" class="wp-caption aligncenter">
  <img src="/content/uploads/2013/11/Capture11.png" alt="Figure 4: Jumbo Frames with Distributed vSwitch" width="1117" height="535" class="size-full wp-image-571" srcset="/content/uploads/2013/11/Capture11.png 1117w, /content/uploads/2013/11/Capture11-500x239.png 500w, /content/uploads/2013/11/Capture11-1024x490.png 1024w" sizes="(max-width: 1117px) 100vw, 1117px" />

  <p class="wp-caption-text">
    Figure 4: Jumbo Frames with Distributed vSwitch
  </p>
</div>

Under the _NIC settings_ tab change the value for _MTU_ to 9000. (See Figure 5).

<div id="attachment_572" style="width: 975px" class="wp-caption aligncenter">
  <img src="/content/uploads/2013/11/Capture02.png" alt="Figure 5: Change MTU settings for a Distributed vSwitch" width="965" height="563" class="size-full wp-image-572" srcset="/content/uploads/2013/11/Capture02.png 965w, /content/uploads/2013/11/Capture02-500x291.png 500w" sizes="(max-width: 965px) 100vw, 965px" />

  <p class="wp-caption-text">
    Figure 5: Change MTU settings for a Distributed vSwitch
  </p>
</div>

### VMKernel ports

Next change the MTU setting of the VMKernel that you want to use with Jumbo Frames. This could e.g. be the VMkernel port used for iSCSI or NFS storage, or the VMKernel port used for VMotion.

Select the ESXi host that hosts the desired VMkernel port and navigate to _Manage -> Networking -> Virtual adapters -> Desired VMKernel Device -> Edit_. (See Figure 6).

<div id="attachment_574" style="width: 898px" class="wp-caption aligncenter">
  <img src="/content/uploads/2013/11/Capture03.png" alt="Figure 6: Jumbo Frames with VMkernel ports" width="888" height="495" class="size-full wp-image-574" srcset="/content/uploads/2013/11/Capture03.png 888w, /content/uploads/2013/11/Capture03-500x278.png 500w" sizes="(max-width: 888px) 100vw, 888px" />

  <p class="wp-caption-text">
    Figure 6: Jumbo Frames with VMkernel ports
  </p>
</div>

Under the _NIC settings_ tab, change the _MTU_ value to be 9000. (See Figure 7).

<div id="attachment_575" style="width: 977px" class="wp-caption aligncenter">
  <img src="/content/uploads/2013/11/Capture05.png" alt="Figure 7: Changing MTU settings of a VMkernel port" width="967" height="565" class="size-full wp-image-575" srcset="/content/uploads/2013/11/Capture05.png 967w, /content/uploads/2013/11/Capture05-500x292.png 500w" sizes="(max-width: 967px) 100vw, 967px" />

  <p class="wp-caption-text">
    Figure 7: Changing MTU settings of a VMkernel port
  </p>
</div>

You will have to repeat these steps for all VMkernel ports on all your hosts that you want to leverage Jumbo Frames on.

### Testing functionality

With all the configuration changes needed at so many different places, it is easy to miss a spot or two. Therefore it is highly recommend to test your settings, before declaring victory.

For this purpose we will use the ESXi tool vmkping to send test traffic from an ESXi host to the storage array or another ESXi host - depending on your use case.

<div id="attachment_577" style="width: 605px" class="wp-caption aligncenter">
  <img src="/content/uploads/2013/11/Capture09.png" alt="Figure 8: Options for the tool vmkping " width="595" height="354" class="size-full wp-image-577" srcset="/content/uploads/2013/11/Capture09.png 595w, /content/uploads/2013/11/Capture09-500x297.png 500w" sizes="(max-width: 595px) 100vw, 595px" />

  <p class="wp-caption-text">
    Figure 8: Options for the tool vmkping
  </p>
</div>

Looking at the options of the vmkping tool, we see two options that are important for this test. (See Figure 8).

One is the ability to set the so-called DF bit or "Do not fragment" with the _-d_ switch. The other is the ability to specify the desired payload size for the ping packet with the _-s_ switch.

Unfortunately the build-in documentation for this tool isn't very good, as it doesn't tell you that the _-s_ switch specifies the payload size of the ICMP packet. You therefore need to add 8 bytes of ICMP headers and 20 bytes of IP headers before you end up with the frame size that will actually hit the wire. (See Figure 9).

Also the "Do not fragment" will instruct the network layer of the ESXi host as well as all other network elements not to fragment - therefore not to split up - the packet.

<div id="attachment_578" style="width: 579px" class="wp-caption aligncenter">
  <img src="/content/uploads/2013/11/ICMP-Packet.png" alt="Figure 9: IP Datagram" width="569" height="262" class="size-full wp-image-578" srcset="/content/uploads/2013/11/ICMP-Packet.png 569w, /content/uploads/2013/11/ICMP-Packet-500x230.png 500w" sizes="(max-width: 569px) 100vw, 569px" />

  <p class="wp-caption-text">
    Figure 9: IP Datagram
  </p>
</div>

In order to assemble a test frame with the size of 9000 bytes, you only need to specify an ICMP payload of 8972 bytes.

If you configured your network correctly, using _vmkping -d -s 8972 <IP of storage array>_ should therefore generate test traffic which is transported to the storage array and back. (See Figure 10).

<div id="attachment_579" style="width: 544px" class="wp-caption aligncenter">
  <img src="/content/uploads/2013/11/Capture07.png" alt="Figure 10: Successful vmkping with Jumbo Frames" width="534" height="231" class="size-full wp-image-579" srcset="/content/uploads/2013/11/Capture07.png 534w, /content/uploads/2013/11/Capture07-500x216.png 500w" sizes="(max-width: 534px) 100vw, 534px" />

  <p class="wp-caption-text">
    Figure 10: Successful vmkping with Jumbo Frames
  </p>
</div>

In case you forgot to configure one of the network elements or specified the wrong payload size, vmkping will indicate you that it cannot send the desired test frame. (See Figure 11).

<div id="attachment_580" style="width: 523px" class="wp-caption aligncenter">
  <img src="/content/uploads/2013/11/Capture08.png" alt="Figure 11: Unsuccessful vmkping with Jumbo Frames" width="513" height="181" class="size-full wp-image-580" srcset="/content/uploads/2013/11/Capture08.png 513w, /content/uploads/2013/11/Capture08-500x176.png 500w" sizes="(max-width: 513px) 100vw, 513px" />

  <p class="wp-caption-text">
    Figure 11: Unsuccessful vmkping with Jumbo Frames
  </p>
</div>

### Configuring Jumbo Frames via CLI

In case you want to configure Jumbo Frames via the CLI for a Default vSwitch or a VMKernel ports, here is what you need to do:

  * Example for vSwitch

    List available Default vSwitches:

    `esxcfg-vswitch --list`</p>
    Change the MTU setting for vSwitch0:

    `esxcfg-vswitch --mtu 9000 vSwitch0` </li>

      * Example for VMkernel interface

        List available VMKernel ports:

        `esxcfg-vmknic --list`</p>
        Change the MTU settings for a VMKernel port:

        `esxcfg-vmknic --mtu 9000 "VMkernel Portgroup Name"` </li> </ul>

        ### Jumbo Frames on guests (Virtual Machines)

        The default emulated Intel E1000 network device presented to guests in VMware ESX does not support Jumbo Frames, one must install VMware Tools and enable a VMXNET3 or newer interface to take advantage of Jumbo Frames.
        
