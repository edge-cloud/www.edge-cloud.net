---
id: 48
title: 'Configuring F5 Big-IP LTM with VMware vCloud Director [Updated]'
date: 2013-05-20 13:30:00 -0700
author: Christian Elsen
excerpt: >-
  Complete and comprehensive walk through guide for the load balancing
  configuration of an F5 Big-IP LTM with VMware vCloud Director (vCD).
layout: single
permalink: /2013/05/20/configuring-f5-big-ip-with-vcd/
redirect_from: 
  - /2013/05/20/configuring-f5-big-ip-with-vcd/amp/
  - /2013/05/configuring-f5-big-ip-with-vcd/
categories:
  - EdgeCloud
tags:
  - F5
  - VMware
---

While there are numerous instructions and blog posts out there which try to show the load balancing configuration of an F5 Big-IP LTM with VMware vCloud Director (vCD), none of them proved to be complete and comprehensive. This post attempts to give this complete and comprehensive walk through guide.

*Update June 06, 2013:* In the original version of this article, I described the usage of a standard F5 TCP monitor for the vCD Console Proxy. Thanks a lot to Cristi Calin for pointing out that this will lead to a log pollution, as each connection by the F5 monitor is logged as a failed attempt on vCD. Thus this revised guide makes usage of a console proxy feature to access the SDK to monitor the health of a cell for the Console Proxy.

**1. Logical setup of a load-balanced VMware vCloud Director configuration**

The goal will be to frontend two or more VMware vCloud Director cells with a F5 Big-IP LTM as shown in Figure 1. HTTPS and Console Proxy traffic shall be forwarded to one of the cells and HTTP traffic shall be terminated on the load balancer and answered with a HTTP 301 (Redirect) answer to the https://… URL.

<div id="attachment_49" style="width: 741px" class="wp-caption aligncenter">
  <img class="size-full wp-image-49" alt="Figure 1: VMware vCloud Director with an F5 Big-IP LTM load balancer" src="/content/uploads/2013/05/vCD11.png" width="731" height="213" />

  <p class="wp-caption-text">
    <br />Figure 1: VMware vCloud Director with an F5 Big-IP LTM load balancer
  </p>
</div>

Each VMware vCloud Director cell is configured with at least two IP addresses. One to terminate HTTP and HTTPS communication to access the web-based GUI as well as the REST API, the other one for accessing the Console Proxy. As a result also the F5 Big-IP LTM needs to host two Virtual IP (VIP) to offer the corresponding services.

Let’s look at the desired traffic flow for HTTPS, HTTP and Console Proxy in detail:

**1.1 HTTPS**

As shown in Figure 2, HTTPS traffic will reside on IP 1 with the port TCP/443 of the LTM and be load balanced across the cells to port TCP/443 on their IP 1. This traffic is standard HTTPS traffic and used for accessing the web-based GUI by either Administrators or End-Users as well as API access. It is therefore possible to use L7 load balancing and apply WAN acceleration as well as SSL termination to this traffic. This virtual server will later be accessible e.g. under the URL https://vcd.edge-cloud.net

<div id="attachment_50" style="width: 740px" class="wp-caption aligncenter">
  <img class="size-full wp-image-50" alt=" Figure 2: Desired traffic flow for HTTPS" src="/content/uploads/2013/05/vCD21.png" width="730" height="224" />

  <p class="wp-caption-text">
    <br />Figure 2: Desired traffic flow for HTTPS
  </p>
</div>

**1.2 HTTP**

HTTP traffic is automatically redirected by VMware vCloud Director cells to HTTPS. Instead of forwarding HTTP traffic to the vCD cells, this redirect should be performed by the LTM as shown in Figure 3. Using an F5 iRule script this also gives the added benefit of specifying the destination of this redirect. As an example http://vcd.edge-cloud.net/ could be redirected to https://vcd.edge-cloud.net/cloud/org/MyOrg/.

<div id="attachment_51" style="width: 740px" class="wp-caption aligncenter">
  <img class="size-full wp-image-51" alt="Figure 3: Desired traffic flow for HTTP" src="/content/uploads/2013/05/vCD311.png" width="730" height="224" />

  <p class="wp-caption-text">
    <br />Figure 3: Desired traffic flow for HTTPS
  </p>
</div>

**1.3 Console Proxy**

Although the Console Proxy uses the port TCP/443, the VMware Remote Console (VMRC) traffic across it, is not HTTPS traffic. Instead it is a VMware proprietary protocol that is tunneled through this well-known port. It is therefore only possible to use L4 load balancing and cannot use additional WAN acceleration or SSL termination. As port TCP/443 is also already used for the web-based GUI on IP 1, the Console Proxy has to be bound to IP 2.

To make things a bit more confusing, the Console Proxy can actually reply to standard HTTPS requests and thus acts like a standard web server in some way. We will use this capability to monitor the Console Proxy for health. More later in section 2.1.2.

<div id="attachment_52" style="width: 740px" class="wp-caption aligncenter">
  <a href="/content/uploads/2013/05/vCD41.png"><img class="size-full wp-image-52" alt="Figure 4: Desired traffic flow for Console Proxy" src="/content/uploads/2013/05/vCD41.png" width="730" height="229" /></a>

  <p class="wp-caption-text">
    <br />Figure 4: Desired traffic flow for Console Proxy
  </p>
</div>

**2. Configuring F5 Big-IP LTM**

Configuring the F5 Big-IP LTM to reside in front of VMware vCloud Director cells requires a common set of configuration steps:

1. Creating custom health monitors for vCD HTTPS and Console Proxy
2. Creating member pools with the vCD cells to distribute requests among
3. Creating an iRule for the HTTP to HTTPS redirect
4. Creating the virtual servers accessible by end-users for HTTPS and Console Proxy

**2.1 Creating a custom health monitor for vCD HTTPS and Console Proxy**

**2.1.1 HTTPS Health Monitor**

A VMware vCloud Director cell offers the special URL *https://hostname-of-cell/cloud/server\_status*, which shows whether the web-based GUI and API on that cell is fully functional or not. This provides advanced health information beyond e.g. just monitoring port TCP/443 for accessibility. Therefore we will create a custom health monitor (Figure 5) within F5 Big-IP to make use of this capability.

<div id="attachment_66" style="width: 890px" class="wp-caption aligncenter">
  <img src="/content/uploads/2013/05/vCD_HTTPS_Monitor.png" alt="Figure 5: Custom HTTP monitor in F5 Big-IP for VMware vCloud Director" width="880" height="803" class="size-full wp-image-66" srcset="/content/uploads/2013/05/vCD_HTTPS_Monitor.png 880w, /content/uploads/2013/05/vCD_HTTPS_Monitor-300x273.png 300w" sizes="(max-width: 880px) 100vw, 880px" />

  <p class="wp-caption-text">
    <br />Figure 5: Custom HTTP monitor in F5 Big-IP for VMware vCloud Director
  </p>
</div>

* Step 1: Click on the “plus” icon right next to *Monitors* to create a new monitor.
* Step 2: Make sure to select *HTTPS* as the parent monitor type.
* Step 3: Reduce the *Interval* and *Timeout* value for this monitor to be a bit more aggressive in detecting failures in a timely fashion.
* Step 4: Enter the Send String *“GET /cloud/server\_statusrn”*. This string includes the above mentioned URL.
* Step 5: Enter the Receive String *“Service is up.”*. This string is the expected string for the case that the service is healthy.

**2.1.2 Console Proxy Health Monitor**

The actual VMware Remote Console (VMRC) traffic is only using the well-known port of 443, but is itself not HTTPS traffic. Nevertheless, the Console Proxy on the vCD cells does react to certain types of HTTPS requests and delivers information back via HTTPS.

Although it would be sufficient to configure the F5 load balancer with a standard TCP monitor – that monitors if port TCP/443 is alive – this leads to log file pollution on the corresponding vCD cells. Each such monitor request would be considered a failed connection and logged accordingly.

Thus a better approach is to use the possibility to connect with a standard webbrowser to the special URL *https://hostname-of-console-proxy-cell/sdk/vimServiceVersions.xml*, which delivers back an XML file with information about the Console Proxy version.

While the Console Proxy is healthy and able to proxy VMRC traffic, it will serve this XML file. Therefore we will create a custom health monitor (Figure 6) within F5 Big-IP to make use of this capability.

<div id="attachment_238" style="width: 717px" class="wp-caption aligncenter">
  <img src="/content/uploads/2013/05/vCD_CP_Monitor.png" alt="Figure 6: Custom Console Proxy monitor in F5 Big-IP for VMware vCloud Director" width="707" height="589" class="size-full wp-image-238" srcset="/content/uploads/2013/05/vCD_CP_Monitor.png 707w, /content/uploads/2013/05/vCD_CP_Monitor-500x416.png 500w" sizes="(max-width: 707px) 100vw, 707px" />

  <p class="wp-caption-text">
    <br />Figure 6: Custom Console Proxy monitor in F5 Big-IP for VMware vCloud Director
  </p>
</div>

* Step 1: Click on the “plus” icon right next to *Monitors* to create a new monitor and make sure to select *HTTPS* as the parent monitor type.
* Step 2: Reduce the *Interval* and *Timeout* value for this monitor to be a bit more aggressive in detecting failures in a timely fashion.
* Step 3: Enter the Send String *“GET /sdk/vimServiceVersions.xml HTTP/1.1rnrnConnection: Closernrn”*. This string includes the above mentioned URL.
* Step 4: Enter the Receive String *“urn:vim25”*. This string is the expected string for the case that the service is healthy.

**2.2 Creating member pools with the vCD cells to distribute requests among**

As shown in the Logical Setup section each vCD cell consist of two IP addresses. One used for the web-based GUI and API, the other one for the Console Proxy. As such we need to create two member pools (Figure 7):

* HTTPS Pool: This pool includes IP 1 of all vCD cells and is used to distribute HTTPS request for the web-based GUI and API.
* Console Proxy Pool: This pool includes IP 2 of all vCD cells and is used to distribute the Console Proxy requests.

<div id="attachment_87" style="width: 1023px" class="wp-caption aligncenter">
  <img src="/content/uploads/2013/05/pools_overview.png" alt="Figure 7: Overview of the pools to be created " width="1013" height="73" class="size-full wp-image-87" srcset="/content/uploads/2013/05/pools_overview.png 1013w, /content/uploads/2013/05/pools_overview-300x21.png 300w" sizes="(max-width: 1013px) 100vw, 1013px" />

  <p class="wp-caption-text">
    <br />Figure 7: Overview of the pools to be created
  </p>
</div>

Let’s start with the HTTPS pool:

<div id="attachment_241" style="width: 729px" class="wp-caption aligncenter">
  <img src="/content/uploads/2013/05/vCD_Pool_HTTPS1.png" alt="Figure 8: HTTPS pool in F5 Big-IP for VMware vCloud Director" width="719" height="515" class="size-full wp-image-241" srcset="/content/uploads/2013/05/vCD_Pool_HTTPS1.png 719w, /content/uploads/2013/05/vCD_Pool_HTTPS1-500x358.png 500w" sizes="(max-width: 719px) 100vw, 719px" />

  <p class="wp-caption-text">
    <br />Figure 8: HTTPS pool in F5 Big-IP for VMware vCloud Director
  </p>
</div>

Select the previously created custom health monitor for vCD as Health Monitor.

For the members specify the IP 1 of all your vCD cells along with HTTPS as the service port.

Next, create the Console Proxy pool:

<div id="attachment_240" style="width: 751px" class="wp-caption aligncenter">
  <img src="/content/uploads/2013/05/vCD_Pool_CP1.png" alt="Figure 9: Console Proxy pool in F5 Big-IP for VMware vCloud Director" width="741" height="512" class="size-full wp-image-240" srcset="/content/uploads/2013/05/vCD_Pool_CP1.png 741w, /content/uploads/2013/05/vCD_Pool_CP1-500x345.png 500w" sizes="(max-width: 741px) 100vw, 741px" />

  <p class="wp-caption-text">
    Figure 9: Console Proxy pool in F5 Big-IP for VMware vCloud Director
  </p>
</div>

Ensure that *tcp* is selected as health monitor and not e.g. *https*. Keep in mind that even though the Console Proxy used the port TCP/443, it is not HTTPS traffic.

For the members specify the IP 2 of all your vCD cells along with HTTPS (port 443) as the service port. The selection of HTTPS will only enter 443 as the port but does not have any influence on the F5 Big-IP treating this traffic as HTTPS traffic.

**2.3 Creating an iRule for the HTTP to HTTPS redirect**

A custom iRule will allow you to redirect users accessing the IP 1 of the Big-IP load balancer via HTTP to the desired URL of the vCloud Service including the HTTPS part. This destination could e.g. be *https://vcd.edge-cloud.net/cloud/* to access the web-based admin UI or *https://vcd.edge-cloud.net/cloud/org/MyOrg/* to reach the web-based UI for a certain Org VDC.

<div id="attachment_74" style="width: 871px" class="wp-caption aligncenter">
  <img class="size-full wp-image-74" alt="Figure 10: Custom iRule for redirecting HTTP traffic to a custom vCD URL" src="/content/uploads/2013/05/iRule1.png" width="861" height="680" />

  <p class="wp-caption-text">
    <br />Figure 10: Custom iRule for redirecting HTTP traffic to a custom vCD URL
  </p>
</div>

**2.4 Creating the virtual servers accessible by end-users for HTTPS and Console Proxy**

To implement the Logical Setup shown above we need to create a total of three virtual servers on the F5 Big-IP LTM (Figure 11):

1. HTTPS Virtual Server: This server is attached to IP 1 of the Big-IP LTM and serves web-based GUI and API.
2. HTTP Virtual Server: This server is attached to IP 1 of the Big-IP LTM and redirects clients to the HTTPS virtual server.
3. Console Proxy Server: This server is attached to IP 2 of the Big-IP LTM and serves the Console Proxy.

<div id="attachment_88" style="width: 997px" class="wp-caption aligncenter">
  <img src="/content/uploads/2013/05/vip_overview.png" alt="Figure 11: Overview of Virtual Servers to be created" width="987" height="100" class="size-full wp-image-88" srcset="/content/uploads/2013/05/vip_overview.png 987w, /content/uploads/2013/05/vip_overview-300x30.png 300w" sizes="(max-width: 987px) 100vw, 987px" />

  <p class="wp-caption-text">
    <br />Figure 11: Overview of Virtual Servers to be created
  </p>
</div>

Let’s start with the HTTPS Virtual Server:

<div id="attachment_90" style="width: 942px" class="wp-caption aligncenter">
  <img src="/content/uploads/2013/05/VirtServ_HTTPS_1.png" alt="Figure 12: Virtual Server for HTTPS - General Properties and Configuration" width="932" height="857" class="size-full wp-image-90" srcset="/content/uploads/2013/05/VirtServ_HTTPS_1.png 932w, /content/uploads/2013/05/VirtServ_HTTPS_1-300x275.png 300w" sizes="(max-width: 932px) 100vw, 932px" />

  <p class="wp-caption-text">
    <br />Figure 12: Virtual Server for HTTPS - General Properties and Configuration
  </p>
</div>

* Step 1: Specify the IP 1 of the Big-IP LTM under which you will serve the VMware vCloud Director.
* Step 2: Specify *HTTPS* as the *“Service Port”*.
* Step 3: Choose *http* as the *“HTTP Profile”*. This Virtual Server serves standard HTTPS content and can therefore make use of L7 load balancing.
* Step 4: Pick *wan-optimized-compression* as *“HTTP Compression Profile”*. This will compress this standard HTTPS content stream.
* Step 5: Pick the SSL certificate corresponding to your VMware vCloud Director service in the *“SSL Profile (Client)”*. As we are using L7 load balancing, the SSL connection will actually be terminated on the F5 Big-IP LTM.
* Step 6: Specify *serverssl-insecure-compatible* as the *SSL Profile (Server)*.
* Step 7: Choose *Auto Map* as the *SNAT Pool* to make use of Static NAT. This is for the case where your VMware vCloud Director cell’s IP addresses are not directly accessible by the clients.

<div id="attachment_242" style="width: 681px" class="wp-caption aligncenter">
  <img src="/content/uploads/2013/05/VirtServ_CP_21.png" alt="Figure 13: Virtual Server for HTTPS – Resources" width="671" height="407" class="size-full wp-image-242" srcset="/content/uploads/2013/05/VirtServ_CP_21.png 671w, /content/uploads/2013/05/VirtServ_CP_21-500x303.png 500w" sizes="(max-width: 671px) 100vw, 671px" />

  <p class="wp-caption-text">
    <br />Figure 13: Virtual Server for HTTPS – Resources
  </p>
</div>

* Step 8: As the *Default Pool* choose the HTTPS pool created in step 2.2.
* Step 9: As the *Default Persistence Profile* choose *source\_address*

Although a once established VMRC connection remains connected through the same vCD irrespective of the above setting, new and re-established connections might be distributed by the F5 to another cell. If this connection is not a new VMRC connection, but a re-established one, vCD will complain in it’s log files and the connection might fail. The above setting will pin all connections originating from the same source address to the same vCD cell and thereby prevent any issues.

Next we will create the HTTP Virtual Server:

<div id="attachment_92" style="width: 892px" class="wp-caption aligncenter">
  <img src="/content/uploads/2013/05/VirtServ_HTTP_1.png" alt="Figure 14: Virtual Server for HTTPS - General Properties and Configuration" width="882" height="860" class="size-full wp-image-92" srcset="/content/uploads/2013/05/VirtServ_HTTP_1.png 882w, /content/uploads/2013/05/VirtServ_HTTP_1-300x292.png 300w" sizes="(max-width: 882px) 100vw, 882px" />

  <p class="wp-caption-text">
    <br />Figure 14: Virtual Server for HTTP - General Properties and Configuration
  </p>
</div>

* Step 1: Specify the IP 1 of the Big-IP LTM under which you will serve the VMware vCloud Director.
* Step 2: Specify *HTTPS* as the *“Service Port”*.
* Step 3: Choose *http* as the *“HTTP Profile”*. This Virtual Server serves standard HTTPS content and can therefore make use of L7 load balancing.

<div id="attachment_93" style="width: 702px" class="wp-caption aligncenter">
  <img src="/content/uploads/2013/05/VirtServ_HTTP_2.png" alt="Figure 15: Virtual Server for HTTP - Resources" width="692" height="598" class="size-full wp-image-93" srcset="/content/uploads/2013/05/VirtServ_HTTP_2.png 692w, /content/uploads/2013/05/VirtServ_HTTP_2-300x259.png 300w" sizes="(max-width: 692px) 100vw, 692px" />

  <p class="wp-caption-text">
    Figure 15: Virtual Server for HTTP - Resources
  </p>
</div>

* Step 4: As iRule choose the custom iRule created in step 2.3.

Last let’s create the Console Proxy Virtual Server:

<div id="attachment_94" style="width: 892px" class="wp-caption aligncenter">
  <img src="/content/uploads/2013/05/VirtServ_CP_1.png" alt="Figure 16: Virtual Server for Console Proxy - General Properties and Configuration" width="882" height="859" class="size-full wp-image-94" srcset="/content/uploads/2013/05/VirtServ_CP_1.png 882w, /content/uploads/2013/05/VirtServ_CP_1-300x292.png 300w" sizes="(max-width: 882px) 100vw, 882px" />

  <p class="wp-caption-text">
    <br />Figure 16: Virtual Server for Console Proxy - General Properties and Configuration
  </p>
</div>

* Step 1: Specify the IP 1 of the Big-IP LTM under which you will serve the VMware vCloud Director.
* Step 2: Specify *HTTPS* as the *“Service Port”*.
* Step 3: Choose *none* as the *“HTTP Profile”*. This Virtual Server serves the Console Proxy and can therefore only make usage of L3 load balancing (TCP).
* Step 4: Choose *Auto Map* as the *SNAT Pool* to make use of static NAT. This is for the case where your VMware vCloud Director cell’s IP addresses are not directly accessible by the clients.

<div id="attachment_95" style="width: 681px" class="wp-caption aligncenter">
  <img src="/content/uploads/2013/05/VirtServ_CP_2.png" alt="Figure 17: Virtual Server for Console Proxy - Resources" width="671" height="406" class="size-full wp-image-95" srcset="/content/uploads/2013/05/VirtServ_CP_2.png 671w, /content/uploads/2013/05/VirtServ_CP_2-300x181.png 300w" sizes="(max-width: 671px) 100vw, 671px" />

  <p class="wp-caption-text">
    <br />Figure 17: Virtual Server for Console Proxy - Resources
  </p>
</div>

* Step 5: As the Default Pool choose the Console Proxy pool created in step 2.2.

**4.0 Configuring VMware vCloud Director**

As a last step the DNS names mapped to the IP addresses of the virtual servers above need to be configured within VMware vCloud Director under *“Administration -&gt; System Settings -&gt; Public Addresses”*. Refer to Figure 16 for an example.

<div id="attachment_97" style="width: 959px" class="wp-caption aligncenter">
  <img src="/content/uploads/2013/05/vCD_public_address.png" alt="Figure 18: Configuring Public Addresses in vCD" width="949" height="474" class="size-full wp-image-97" srcset="/content/uploads/2013/05/vCD_public_address.png 949w, /content/uploads/2013/05/vCD_public_address-300x149.png 300w" sizes="(max-width: 949px) 100vw, 949px" />

  <p class="wp-caption-text">
    <br />Figure 18: Configuring Public Addresses in vCD
  </p>
</div>

**4.0 Additional Comments**

A few closing remarks:

**4.1 Session persistence**

Although not required it is possible to configure the Virtual Server for HTTPS with session persistence (Figure 12), similar to the Console Proxy. Possible options would be Cookie-based or Source-IP address-based.

**4.2 SSL termination**

Unfortunately VMware vCloud Director does not allow disabling of HTTPS in favor of HTTP. This would allow termination of the SSL session on the F5 Big-IP LTM – as the configuration above showcases – while at the same time offloading the vCD cell from SSL encryption/decryption load. Thus traffic from the load balancer to the cells still need to be SSL encrypted.
