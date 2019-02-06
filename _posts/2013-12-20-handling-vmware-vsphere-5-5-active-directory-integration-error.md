---
id: 822
title: Handling the VMware vSphere 5.5 Active Directory integration error
date: 2013-12-20T15:28:24+00:00
author: Christian Elsen
excerpt: 'While attempting to integrate the VMware vSphere 5.5 vCenter Server Appliance (vCSA) with Microsoft Active Directory you might have stumbled over the error message "Error: Idm client exception: Failed to establish server connection". This article will show you how to work around this issue and still use Active Directory with your vCSA.'
layout: single
permalink: /2013/12/20/handling-vmware-vsphere-5-5-active-directory-integration-error/
redirect_from: 
  - /2013/12/20/handling-vmware-vsphere-5-5-active-directory-integration-error/amp/
  - /2013/12/handling-vmware-vsphere-5-5-active-directory-integration-error/
categories:
  - EdgeCloud
tags:
  - VMware
---
While attempting to integrate the VMware vSphere 5.5 vCenter Server Appliance (vCSA) with Microsoft Active Directory you might have stumbled over the error message &#8220;Error: Idm client exception: Failed to establish server connection&#8221;. This article will show you how to work around this issue and still use Active Directory with your vCSA.

### Reproduce the error

The following steps show you how to reproduce the error. In a subsequent step you will then see how to prevent it.

We start with the VMware vCenter Server Appliance (vCSA) joined to the Active Directory (See Figure 1).



<div id="attachment_823" style="width: 460px" class="wp-caption aligncenter">
  <img src="/content/uploads/2013/12/vC-SSO-Bug00-e1387497276287.png" alt="Figure 1: VMware vCenter Server Appliance with Active Directory integration enabled" width="450" height="365" class="size-full wp-image-823" />

  <p class="wp-caption-text">
    Figure 1: VMware vCenter Server Appliance with Active Directory integration enabled
  </p>
</div>

Login with the vCSA SSO credentials _Administrator@vsphere.local_. It has a default password of _vmware_ (See Figure 2). Note that this account is different from the user _root_.



<div id="attachment_825" style="width: 310px" class="wp-caption aligncenter">
  <img src="/content/uploads/2013/12/vC-SSO-Bug02-e1387497306652.png" alt="Figure 2: Login to vCSA with the SSO administrator credentials" width="300" height="108" class="size-full wp-image-825" />

  <p class="wp-caption-text">
    Figure 2: Login to vCSA with the SSO administrator credentials
  </p>
</div>

Navigate to _Home -> Administration -> Single Sign-On -> Configuration_ (See Figure 3).



<div id="attachment_826" style="width: 510px" class="wp-caption aligncenter">
  <img src="/content/uploads/2013/12/vC-SSO-Bug0304-e1387497239511.png" alt="Figure 3: Navigate to Administration -> Single Sign-On -> Configuration" width="500" height="219" class="size-full wp-image-826" />

  <p class="wp-caption-text">
    Figure 3: Navigate to Administration -> Single Sign-On -> Configuration
  </p>
</div>

Next, try to create a new _Identity Source_ (See Figure 4).



<div id="attachment_827" style="width: 260px" class="wp-caption aligncenter">
  <img src="/content/uploads/2013/12/vC-SSO-Bug05-e1387497381600.png" alt="Figure 4: Add a new SSO Identity Source" width="250" height="112" class="size-full wp-image-827" />

  <p class="wp-caption-text">
    Figure 4: Add a new SSO Identity Source
  </p>
</div>

As the vCSA is already joined to the Active Directory domain the expectation would be to use the _Integrated Windows Authentication_ for Active Directory along with using the vCSA machine account. In the end, that&#8217;s why we added vCSA to the Active Directory in the first place. Unfortunately we will soon see that we are let down on this expectation.

For now select as the _Identity source type_ the value _Active Directory (Integrated Windows Authentication)_, confirm your domain name and select _Use machine account_ (See Figure 5).



<div id="attachment_828" style="width: 610px" class="wp-caption aligncenter">
  <img src="/content/uploads/2013/12/vC-SSO-Bug06-e1387497490329.png" alt="Figure 5: Configure an Active Directory identity source with default parameters" width="600" height="527" class="size-full wp-image-828" />

  <p class="wp-caption-text">
    Figure 5: Configure an Active Directory identity source with default parameters
  </p>
</div>

After closing the previous dialog with _OK_, you should see the new _identity source_ (See Figure 6).



<div id="attachment_829" style="width: 660px" class="wp-caption aligncenter">
  <img src="/content/uploads/2013/12/vC-SSO-Bug07-e1387497576342.png" alt="Figure 6: Active Directory identity source" width="650" height="176" class="size-full wp-image-829" />

  <p class="wp-caption-text">
    Figure 6: Active Directory identity source
  </p>
</div>

Next, navigate to _Administration -> Configuration -> Single Sign-On -> Users and Groups -> Users_ and pick under _Domain_ the domain you just created (See Figure 7).



<div id="attachment_830" style="width: 410px" class="wp-caption aligncenter">
  <img src="/content/uploads/2013/12/vC-SSO-Bug08-e1387497692817.png" alt="Figure 7: Attempt to view the users in the Active Directory identity source" width="400" height="232" class="size-full wp-image-830" />

  <p class="wp-caption-text">
    Figure 7: Attempt to view the users in the Active Directory identity source
  </p>
</div>

Instead of displaying the users from Active Directory as expected, vCSA shows the error message &#8220;Error: Idm client exception: Failed to establish server connection&#8221;. Thus it appears as if the default Active Directory integration in vCSA is broken (See Figure 8).



<div id="attachment_831" style="width: 652px" class="wp-caption aligncenter">
  <img src="/content/uploads/2013/12/vC-SSO-Bug09.png" alt="Figure 8: Error message while attemptting to view the users in the Active Directory identity source" width="642" height="378" class="size-full wp-image-831" srcset="/content/uploads/2013/12/vC-SSO-Bug09.png 642w, /content/uploads/2013/12/vC-SSO-Bug09-500x294.png 500w" sizes="(max-width: 642px) 100vw, 642px" />

  <p class="wp-caption-text">
    Figure 8: Error message while attemptting to view the users in the Active Directory identity source
  </p>
</div>

### The Workaround

Now that we have seen the issue, let&#8217;s work around it. This way we can still achieve the goal of using Active Directory as an identity source for SSO in VMware vSphere.

Start by removing the Active Directory identity source that you previously created (See Figure 9).



<div id="attachment_832" style="width: 514px" class="wp-caption aligncenter">
  <img src="/content/uploads/2013/12/vC-SSO-Bug10.png" alt="Figure 9: Remove the Active Directory identity source" width="504" height="245" class="size-full wp-image-832" srcset="/content/uploads/2013/12/vC-SSO-Bug10.png 504w, /content/uploads/2013/12/vC-SSO-Bug10-500x243.png 500w" sizes="(max-width: 504px) 100vw, 504px" />

  <p class="wp-caption-text">
    Figure 9: Remove the Active Directory identity source
  </p>
</div>

Create a new identity source. This time select for the _Identity source type_ the value _Active Directory as a LDAP server_. Fill out the remaining fields as follows (See Figure 10):

  * Name: Your AD domain name; E.g. &#8220;corp.local&#8221;
  * Base DN for users: Split your domain name in pieces along the dots (&#8220;.&#8221;) and prefix each part with a &#8220;dc=&#8221;. Place commas &#8220;,&#8221; in between each part; E.g. &#8220;dc=corp,dc=local&#8221;
  * Domain name: Your AD domain name; E.g. &#8220;corp.local&#8221;
  * Domain alias: Your netbios name of the AD domain; E.g. &#8220;CORP&#8221;
  * Base DN for groups: Same a the Base DN for users; E.g. &#8220;dc=corp,dc=local&#8221;
  * Primary Server URL: The Active Directory server as a URL with the protocol &#8220;ldap://&#8221; and the port 389.; E.g. ldap://192.168.110.10:389
  * Secondary Sever URL: Another Active Directory server as a URL if you have one. Otherwise leave it blank; E.g. ldap://192.168.110.20:389
  * Username: An Active Directory username in netbios notation with privileges to read all users and groups; E.g. &#8220;CORPAdministrator&#8221;
  * Password: The password of the above user.

<div id="attachment_833" style="width: 610px" class="wp-caption aligncenter">
  <img src="/content/uploads/2013/12/vC-SSO-Bug12-e1387497946248.png" alt="Figure 10: Add an identity source with Active Directory as a LDAP Server" width="600" height="526" class="size-full wp-image-833" />

  <p class="wp-caption-text">
    Figure 10: Add an identity source with Active Directory as a LDAP Server
  </p>
</div>

Test your settings by clicking on the _Test Connection_ button. This will attempt to connect to the Active Directory as a LDAP server with the provided settings (See Figure 11).



<div id="attachment_834" style="width: 610px" class="wp-caption aligncenter">
  <img src="/content/uploads/2013/12/vC-SSO-Bug13-e1387498027661.png" alt="Figure 11: Test the connectivity of the new identity source" width="600" height="527" class="size-full wp-image-834" />

  <p class="wp-caption-text">
    Figure 11: Test the connectivity of the new identity source
  </p>
</div>

If the connection test was successful, save the settings. You will notice the new identity source, you just added (See Figure 12).



<div id="attachment_835" style="width: 810px" class="wp-caption aligncenter">
  <img src="/content/uploads/2013/12/vC-SSO-Bug14-e1387498123781.png" alt="Figure 12: Active Directory identity source via LDAP" width="800" height="229" class="size-full wp-image-835" />

  <p class="wp-caption-text">
    Figure 12: Active Directory identity source via LDAP
  </p>
</div>

Now, if you return to _Administration -> Configuration -> Single Sign-On -> Users and Groups -> Users_ and pick under _Domain_ the domain you just created, you will see users and groups from this Active Directory (See Figure 13). With this we have achieved our goal.



<div id="attachment_836" style="width: 510px" class="wp-caption aligncenter">
  <img src="/content/uploads/2013/12/vC-SSO-Bug15-e1387498212565.png" alt="Figure 13: Users in an Active Directory identity source successfully displayed" width="500" height="188" class="size-full wp-image-836" />

  <p class="wp-caption-text">
    Figure 13: Users in an Active Directory identity source successfully displayed
  </p>
</div>

Don&#8217;t forget to add users from your Active Directory to corresponding vCSA groups to grant access to these users (See Figure 14).



<div id="attachment_837" style="width: 660px" class="wp-caption aligncenter">
  <img src="/content/uploads/2013/12/vC-SSO-Bug16-e1387498379409.png" alt="Figure 14: Add Users to the Groups for assigning permissions" width="650" height="463" class="size-full wp-image-837" />

  <p class="wp-caption-text">
    Figure 14: Add Users to the Groups for assigning permissions
  </p>
</div>

Also don&#8217;t forget to add users from your Active Directory to the vCenter Permissions (See Figure 15).



<div id="attachment_1219" style="width: 610px" class="wp-caption aligncenter">
  <img src="/content/uploads/2013/12/vC-SSO-Bug20.png" alt="Figure 15: Add Users to the vCenter" width="600" height="203" class="size-full wp-image-1219" srcset="/content/uploads/2013/12/vC-SSO-Bug20.png 600w, /content/uploads/2013/12/vC-SSO-Bug20-360x121.png 360w, /content/uploads/2013/12/vC-SSO-Bug20-1x1.png 1w" sizes="(max-width: 600px) 100vw, 600px" />

  <p class="wp-caption-text">
    Figure 15: Add Users to the vCenter
  </p>
</div>

### Windows Session Authentication

The Windows Session Authentication for the vSphere Web Client (See Figure 16) will still work with this workaround. The reason is that vCSA uses Kerberos to authenticate the Windows Client against the vSphere Web Client (via an installable plugin). Once that authentication is successful it solely checks in the identity source matching the domain name if that user exists. No Password is ever transferred from the Windows Client to the vCSA or the identity source.

<div id="attachment_1244" style="width: 366px" class="wp-caption aligncenter">
  <img src="/content/uploads/2013/12/vC-SSO-Bug21.png" alt="Figure 16: The Windows session authentication still works" width="356" height="222" class="size-full wp-image-1244" />

  <p class="wp-caption-text">
    Figure 16: The Windows session authentication still works
  </p>
</div>

### Final remarks

One would hope that after joining vCSA to the Active Directory domain, it is possible use the Integrated Windows Authentication for Active Directory along with using the vCSA machine account. While we are being let down on this expectation, the above workaround will at least allow you to use an Active Directory as an identity source for SSO in VMware vSphere.

Keep in mind that for adding Active Directory as an identity source via LDAP it is not necessary to join the vCSA to Active Directory. But you might have other independent reasons to do so.
