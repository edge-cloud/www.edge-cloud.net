---
id: 319
title: Arista vEOS on VMware ESX
date: 2013-06-13T12:40:43+00:00
author: Christian Elsen
excerpt: EOS is released as a single image that supports all of their hardware platforms. But that same single image can also be run in a virtual machine! While a great article on "Building a Virtual Lab with Arista vEOS and VirtualBox" already exists, I wanted to accomplish the same with vSphere 5.x.
layout: single
permalink: /2013/06/13/arista-veos-on-vmware-esx/
redirect_from:
  - /2013/06/13/arista-veos-on-vmware-esx/amp/
categories:
  - EdgeCloud
tags:
  - Arista
  - Network
---
[Arista](https://www.arista.com/en/) EOS is released as a single image that supports all of their hardware platforms. But that same single image can also be run in a virtual machine! While a great article on [Building a Virtual Lab with Arista vEOS and VirtualBox](http://www.gad.net/Blog/2012/10/27/building-a-virtual-lab-with-arista-veos-and-virtualbox/) already exists, I wanted to accomplish the same with vSphere 5.x.

Here's how I did it.

**Pre-Requisites**

Besides at least one ESXi 5.x host you will need the following files from Arista Networks:

  * The bootloader: Aboot-veos-2.0.8.iso
  * The actual vEOS image as a VMDK: EOS-4.12.0-veos.vmdk

Note: This guide is current as of June 13, 2013. I have used the latest available vEOS VMDK file. You might want to check if a newer vEOS files [was published](https://www.arista.com/en/support) in the meantime.

**Build a base VM image in vSphere**

Within your vSphere Client create a new _Custom_ Configuration VM



<div id="attachment_320" style="width: 743px" class="wp-caption aligncenter">
  <img src="/content/uploads/2013/06/NewVM01.png" alt="Figure 1: Create a new custom VM" width="733" height="625" class="size-full wp-image-320" srcset="/content/uploads/2013/06/NewVM01.png 733w, /content/uploads/2013/06/NewVM01-500x426.png 500w" sizes="(max-width: 733px) 100vw, 733px" />

  <p class="wp-caption-text">
    Figure 1: Create a new custom VM
  </p>
</div>

Select a name - e.g. _"Arista vEOS 4.12.0"_ - for your VM and select the Host / Cluster, Resource Pool and Storage applicable to your specific setup.

As the Virtual Machine Version select _"Virtual Machine Version: 8"_.



<div id="attachment_347" style="width: 740px" class="wp-caption aligncenter">
  <img src="/content/uploads/2013/06/NewVM06.png" alt="Figure 2: Virtual Machine Version" width="730" height="623" class="size-full wp-image-347" srcset="/content/uploads/2013/06/NewVM06.png 730w, /content/uploads/2013/06/NewVM06-500x426.png 500w" sizes="(max-width: 730px) 100vw, 730px" />

  <p class="wp-caption-text">
    Figure 2: Virtual Machine Version
  </p>
</div>

As the Guest Operating System choose _"Linux"_ -> _"Other 2.6.x Linux (32-bit)"_.



<div id="attachment_325" style="width: 742px" class="wp-caption aligncenter">
  <img src="/content/uploads/2013/06/NewVM07.png" alt="Figure 3: Guest Operating System" width="732" height="622" class="size-full wp-image-325" srcset="/content/uploads/2013/06/NewVM07.png 732w, /content/uploads/2013/06/NewVM07-500x424.png 500w" sizes="(max-width: 732px) 100vw, 732px" />

  <p class="wp-caption-text">
    Figure 3: Guest Operating System
  </p>
</div>

For the CPU settings choose 1 as the _"Number of Virtual Sockets"_ and also 1 as the _"Number of cores per virtual socket"_.



<div id="attachment_326" style="width: 743px" class="wp-caption aligncenter">
  <img src="/content/uploads/2013/06/NewVM08.png" alt="Figure 4: CPU settings" width="733" height="623" class="size-full wp-image-326" srcset="/content/uploads/2013/06/NewVM08.png 733w, /content/uploads/2013/06/NewVM08-500x424.png 500w" sizes="(max-width: 733px) 100vw, 733px" />

  <p class="wp-caption-text">
    Figure 4: CPU settings
  </p>
</div>

Increase the _"Memory Size"_ to 2 GB.



<div id="attachment_329" style="width: 739px" class="wp-caption aligncenter">
  <img src="/content/uploads/2013/06/NewVM09.png" alt="Figure 5: Memory Size" width="729" height="622" class="size-full wp-image-329" srcset="/content/uploads/2013/06/NewVM09.png 729w, /content/uploads/2013/06/NewVM09-500x426.png 500w" sizes="(max-width: 729px) 100vw, 729px" />

  <p class="wp-caption-text">
    Figure 5: Memory Size
  </p>
</div>

Increase the number of NICs to 4 and choose _E1000_ as the _Adapter_ for all of them. Connect each NIC to a port-group applicable to your specific setup.

The _"NIC 1"_ will appear as the _"Mgmt"_ interface within vEOS. If you didn't create any port-groups specific to your vEOS setup so far, don't worry: Just pick any available port-group. We will get a chance again to change this later.



<div id="attachment_330" style="width: 741px" class="wp-caption aligncenter">
  <img src="/content/uploads/2013/06/NewVM10.png" alt="Figure 6: Network Interfaces" width="731" height="623" class="size-full wp-image-330" srcset="/content/uploads/2013/06/NewVM10.png 731w, /content/uploads/2013/06/NewVM10-500x426.png 500w" sizes="(max-width: 731px) 100vw, 731px" />

  <p class="wp-caption-text">
    Figure 6: Network Interfaces
  </p>
</div>

Leave the "SCSI Controller" at the default value of "LSI Logic Parallel". We will not actually use a SCSI controller.



<div id="attachment_331" style="width: 742px" class="wp-caption aligncenter">
  <img src="/content/uploads/2013/06/NewVM11.png" alt="Figure 7: SCSI Controller" width="732" height="623" class="size-full wp-image-331" srcset="/content/uploads/2013/06/NewVM11.png 732w, /content/uploads/2013/06/NewVM11-500x425.png 500w" sizes="(max-width: 732px) 100vw, 732px" />

  <p class="wp-caption-text">
    Figure 7: SCSI Controller
  </p>
</div>

At this point we will not create a disk. Therefore select "Do not create disk" under "Select disk".



<div id="attachment_332" style="width: 741px" class="wp-caption aligncenter">
  <img src="/content/uploads/2013/06/NewVM12.png" alt="Figure 8: Select a disk" width="731" height="623" class="size-full wp-image-332" srcset="/content/uploads/2013/06/NewVM12.png 731w, /content/uploads/2013/06/NewVM12-500x426.png 500w" sizes="(max-width: 731px) 100vw, 731px" />

  <p class="wp-caption-text">
    Figure 8: Select a disk
  </p>
</div>

Complete the "Create New Virtual Machine" wizard. _Do bot power up the VM yet!!_



<div id="attachment_333" style="width: 741px" class="wp-caption aligncenter">
  <img src="/content/uploads/2013/06/NewVM13.png" alt="Figure 9: Complete &quot;Create New Virtual Machine&quot; wizard" width="731" height="623" class="size-full wp-image-333" srcset="/content/uploads/2013/06/NewVM13.png 731w, /content/uploads/2013/06/NewVM13-500x426.png 500w" sizes="(max-width: 731px) 100vw, 731px" />

  <p class="wp-caption-text">
    Figure 9: Complete "Create New Virtual Machine" wizard
  </p>
</div>

**Upload Aboot and vEOS files**

Next upload the Aboot-veos-2.0.8.iso bootloader and EOS-4.12.0-veos.vmdk disk image file into the folder of your previously created VM within the vSphere data store.



<div id="attachment_334" style="width: 903px" class="wp-caption aligncenter">
  <img src="/content/uploads/2013/06/UploadAristaFiles.png" alt="Figure 10: Upload Boot loader and disk image files" width="893" height="410" class="size-full wp-image-334" srcset="/content/uploads/2013/06/UploadAristaFiles.png 893w, /content/uploads/2013/06/UploadAristaFiles-500x229.png 500w" sizes="(max-width: 893px) 100vw, 893px" />

  <p class="wp-caption-text">
    Figure 10: Upload Boot loader and disk image files
  </p>
</div>

**Change the Virtual Machine settings**

Although we just created the VM for vEOS, we already need to change its settings again. Open the VM's properties via _"Edit Settings"_.

Remove the "Floppy drive 1" hardware item.



<div id="attachment_336" style="width: 722px" class="wp-caption aligncenter">
  <img src="/content/uploads/2013/06/ChangeConfig00.png" alt="Figure 11: Remove Floppy Drive" width="712" height="634" class="size-full wp-image-336" srcset="/content/uploads/2013/06/ChangeConfig00.png 712w, /content/uploads/2013/06/ChangeConfig00-500x445.png 500w" sizes="(max-width: 712px) 100vw, 712px" />

  <p class="wp-caption-text">
    Figure 11: Remove Floppy Drive
  </p>
</div>

Map the _"CD/DVD drive 1"_ to the _Aboot-veos-2.0.8.iso_ bootloader image residing on your datastore. This file needs to remain mounted. It is not only used for installation, but for all future boot cycles.



<div id="attachment_338" style="width: 720px" class="wp-caption aligncenter">
  <img src="/content/uploads/2013/06/ChangeConfig01.png" alt="Figure 12: Mount the Aboot-veos-2.0.8.iso bootloader file" width="710" height="636" class="size-full wp-image-338" srcset="/content/uploads/2013/06/ChangeConfig01.png 710w, /content/uploads/2013/06/ChangeConfig01-500x447.png 500w" sizes="(max-width: 710px) 100vw, 710px" />

  <p class="wp-caption-text">
    Figure 12: Mount the Aboot-veos-2.0.8.iso bootloader file
  </p>
</div>

Add a new device of the type _"Hard Disk"_.



<div id="attachment_340" style="width: 720px" class="wp-caption aligncenter">
  <img src="/content/uploads/2013/06/ChangeConfig011.png" alt="Figure 13: Add Hard Disk" width="710" height="636" class="size-full wp-image-340" srcset="/content/uploads/2013/06/ChangeConfig011.png 710w, /content/uploads/2013/06/ChangeConfig011-500x447.png 500w" sizes="(max-width: 710px) 100vw, 710px" />

  <p class="wp-caption-text">
    Figure 13: Add Hard Disk
  </p>
</div>

Choose "Use an existing virtual disk" as the disk type.



<div id="attachment_339" style="width: 723px" class="wp-caption aligncenter">
  <img src="/content/uploads/2013/06/ChangeConfig03Highlight.png" alt="Figure 14: Use an existing virtual disk" width="713" height="636" class="size-full wp-image-339" srcset="/content/uploads/2013/06/ChangeConfig03Highlight.png 713w, /content/uploads/2013/06/ChangeConfig03Highlight-500x446.png 500w" sizes="(max-width: 713px) 100vw, 713px" />

  <p class="wp-caption-text">
    Figure 14: Use an existing virtual disk
  </p>
</div>

Select the _EOS-4.12.0-veos.vmdk_ disk image file residing on your datastore.



<div id="attachment_341" style="width: 722px" class="wp-caption aligncenter">
  <img src="/content/uploads/2013/06/ChangeConfig04.png" alt="Figure 15: Select vEOS disk image file" width="712" height="636" class="size-full wp-image-341" srcset="/content/uploads/2013/06/ChangeConfig04.png 712w, /content/uploads/2013/06/ChangeConfig04-500x446.png 500w" sizes="(max-width: 712px) 100vw, 712px" />

  <p class="wp-caption-text">
    Figure 15: Select vEOS disk image file
  </p>
</div>

Accept the proposed _"Virtual Device Node"_ with _"IDE (0:0)"_.

Re-connect any NIC devices that you want to change and didn't get a chance so far.

Close the "Add Hardware" wizard and the _"Virtual Machine Properties"_ dialog.

_Boot your vEOS VM_

Now it's time to test if things are working. Power up the vEOS VM and open the Console.



<div id="attachment_343" style="width: 751px" class="wp-caption aligncenter">
  <img src="/content/uploads/2013/06/Boot02.png" alt="Figure 16: vEOS booting on ESX" width="741" height="518" class="size-full wp-image-343" srcset="/content/uploads/2013/06/Boot02.png 741w, /content/uploads/2013/06/Boot02-500x349.png 500w" sizes="(max-width: 741px) 100vw, 741px" />

  <p class="wp-caption-text">
    Figure 16: vEOS booting on ESX
  </p>
</div>

It will take a few moments for vEOS to complete the first boot during which the virtual Flash is being initialized.

Once the boot process is complete you can login with the username _"admin"_ and e.g. list the physical interfaces.



<div id="attachment_342" style="width: 751px" class="wp-caption aligncenter">
  <img src="/content/uploads/2013/06/Boot04.png" alt="Figure 17: Working vEOS install on ESX" width="741" height="519" class="size-full wp-image-342" srcset="/content/uploads/2013/06/Boot04.png 741w, /content/uploads/2013/06/Boot04-500x350.png 500w" sizes="(max-width: 741px) 100vw, 741px" />

  <p class="wp-caption-text">
    Figure 17: Working vEOS install on ESX
  </p>
</div>

Enjoy your newly installed vEOS on ESX!

**What's next?**

As a next step you could import the above vEOS instance into VMware vCloud Director and create simple or complex vApps of vEOS instances depicting various network architectures.



<div id="attachment_345" style="width: 954px" class="wp-caption aligncenter">
  <img src="/content/uploads/2013/06/vEOS-Lab-Physical-Management.png" alt="Figure 18: Sample vEOS lab layout" width="944" height="688" class="size-full wp-image-345" srcset="/content/uploads/2013/06/vEOS-Lab-Physical-Management.png 944w, /content/uploads/2013/06/vEOS-Lab-Physical-Management-500x364.png 500w" sizes="(max-width: 944px) 100vw, 944px" />

  <p class="wp-caption-text">
    Figure 18: Sample vEOS lab layout
  </p>
</div>

Figure 18 shows a sample vEOS lab layout with 3 vEOS VMs and a Windows or Linux Jump Box VM. The VMs are interconnected via various vApp networks.
