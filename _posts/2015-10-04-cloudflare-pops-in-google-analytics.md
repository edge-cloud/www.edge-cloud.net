---
id: 1878
title: Track your CloudFlare PoPs usage in Google Analytics
date: 2015-10-04T20:50:53+00:00
author: Christian Elsen
excerpt: CloudFlare provides a content delivery network and distributed domain name server services to help secure and accelerate websites. This cloud-based service sits between the visitor and the CloudFlare user’s hosting provider, acting as a reverse proxy for the website. This article will help you visualize the global presence of your website, when using CloudFlare, with the well-known tool Google Analytics. You need to have your website running through CloudFlare for this to work.
layout: single
permalink: /2015/10/04/cloudflare-pops-in-google-analytics/
redirect_from: 
  - /2015/10/04/cloudflare-pops-in-google-analytics/amp/
categories:
  - EdgeCloud
tags:
  - Cloudflare
  - Google-Analytics
---
[Cloudflare](https://www.cloudflare.com/) provides a content delivery network and distributed domain name server services to help secure and accelerate websites. This cloud-based service sits between the visitor and the CloudFlare user’s hosting provider, acting as a reverse proxy for the website.

This article will help you visualize the global presence of your website, when using CloudFlare, with the well-known tool [Google Analytics](https://www.google.com/analytics/). You need to have your website running through CloudFlare for this to work.

[Signing up](https://www.cloudflare.com/a/sign-up)&nbsp;wit CloudFlare is easy and free and usually only takes 5 minutes.

### About CloudFlare's Points-of-Presence

CloudFlare currently uses 63 data centers worldwide as points-of-presence to deliver fast and secure website traffic (See Figure 1).

<div id="attachment_1882" style="width: 610px" class="wp-caption aligncenter">
  <a href="/content/uploads/2015/10/CloudFlare_Network_Map.png"><img src="/content/uploads/2015/10/CloudFlare_Network_Map-600x255.png" alt="Figure 1: Current CloudFlare Network Map" width="600" height="255" class="size-large wp-image-1882" srcset="/content/uploads/2015/10/CloudFlare_Network_Map-600x255.png 600w, /content/uploads/2015/10/CloudFlare_Network_Map-350x149.png 350w, /content/uploads/2015/10/CloudFlare_Network_Map.png 1400w" sizes="(max-width: 600px) 100vw, 600px" /></a>

  <p class="wp-caption-text">
    Figure 1: Current CloudFlare Network Map
  </p>
</div>This means that as a CloudFlare customer your website is delivered to your audience from all these locations worldwide, reducing the network hops and lowering latency. As a result your website gains a global presence on an affordable budget, while improving performance.



Wouldn't it be great to get insight into how much these worldwide locations help you with your website? In this post you will learn how to get started by gaining insight into which CloudFlare location delivers your website traffic.

### Create a custom dimension in Google Analytics

First, set up a custom dimensions for the location of the CloudFlare PoP that serves a request in Google Analytics:

  1. Sign in to [Google Analytics](https://www.google.com/analytics/web/#home/).
  2. Select the **Admin** tab and navigate to the **property to which you want to add custom dimensions**.
  3. In the **Property** column, click **Custom Definitions**, then click **Custom Dimensions**.
  4. Click **New Custom Dimension**.
  5. Add a **Name**.

    This can be any string, but use something unique so it’s not confused with any other dimension or metric in your reports. Only you will see this name in the Google Analytics page.
  6. Select the **Scope**.

    Choose to track at the Hit, Session, User, or Product level. For this scenario I recommend to choose Hit or rather Session.
  7. Check the **Active** box to start collecting data and see the dimension in your reports right away. To create the dimension but have it remain inactive, uncheck the box.
  8. Click **Create**.
  9. Note down the dimension ID from the displayed example codes. In the example for this blog post the dimension ID is "1" (See Figure 2).

<div id="attachment_1883" style="width: 610px" class="wp-caption aligncenter">
  <a href="/content/uploads/2015/10/Create-Custom-Dimension.png"><img src="/content/uploads/2015/10/Create-Custom-Dimension-600x210.png" alt="Figure 2: Create a Google Analytics Custom Dimension" width="600" height="210" class="size-large wp-image-1883" srcset="/content/uploads/2015/10/Create-Custom-Dimension-600x210.png 600w, /content/uploads/2015/10/Create-Custom-Dimension-350x123.png 350w, /content/uploads/2015/10/Create-Custom-Dimension.png 1400w" sizes="(max-width: 600px) 100vw, 600px" /></a>

  <p class="wp-caption-text">
    Figure 2: Create a Google Analytics Custom Dimension
  </p>
</div>

### Embed the Google Analytics Tracking Code

Next we need to embed the Google Analytics tracking code within the website, in order to fill the newly created custom dimension with data. This tracking code has to be placed between the code for creating the Google Analytics tracker, which looks like this: `__gaTracker('create','UA-12345678-1','auto');`, and the code to submit the tracker, which looks like this `__gaTracker('send','pageview');`.

If you are using WordPress the easiest way to include the custom tracking code is by using the "[Google Analytics by Yoast](https://wordpress.org/plugins/google-analytics-for-wordpress/)" plugin. This plugin allows you under _Advanced > Custom Code_ to embed the below code right away and without any coding requirements.

But first we have to actually determine the CloudFlare PoP location that serves a request. For this we can use the HTTP response header "cf-ray", which is added by CLoudFlare for troubleshooting purposes. It includes a numeric value, as well as the [location code](https://www.cloudflarestatus.com/) of the CloudFlare PoP.

The below JavaScript code will read the "cf-ray" response header, extract the location ID and push it into the Google Analytics custom dimension variable. Ensure that the numeric ID of this custom dimension variable matches what you have created in above steps.

<pre>function loc(){
var req = new XMLHttpRequest();
req.open('HEAD', document.location, false);
req.send(null);
return (req.getResponseHeader("cf-ray").split("-"))[1];
}
__gaTracker('set','dimension1',loc());</pre>

Embedded in your website along with the standard Google Analytics tracking code, this custom JavaScript code will determine the CloudFlare PoP over which the corresponding site was served and push it into Google Analytics.

A few hours after embedding the code you should see your first custom dimension data in Google Analytics.

### Create a custom report in Google Analytics

You can now create custom reports with the custom dimension in Google Analytics. A simple example would be to determine which CloudFlare PoP serves how many of your audience's session.

  1. Make sure you are still signed in to [Google Analytics](https://www.google.com/analytics/web/#home/).
  2. Select the **Customization** tab and click on **New Custom Report**.
  3. **Name** your Custom Report here.
  4. Select a Metric for which you want to see your Custom Dimensions. I recommend the metric "Sessions" within the "Users" Metric Group.
  5. Next select the custom dimension that you created as the "Dimension Drilldown" (See Figure 3).
  6. Click on the **Save** button.

<div id="attachment_1879" style="width: 610px" class="wp-caption aligncenter">
  <a href="/content/uploads/2015/10/CloudFlare-PoP-Utilization-Edit-Report.png"><img src="/content/uploads/2015/10/CloudFlare-PoP-Utilization-Edit-Report-600x571.png" alt="Figure 3: Create a Custom Report in Google Analytics" width="600" height="571" class="size-large wp-image-1879" srcset="/content/uploads/2015/10/CloudFlare-PoP-Utilization-Edit-Report-600x571.png 600w, /content/uploads/2015/10/CloudFlare-PoP-Utilization-Edit-Report-350x333.png 350w, /content/uploads/2015/10/CloudFlare-PoP-Utilization-Edit-Report.png 1184w" sizes="(max-width: 600px) 100vw, 600px" /></a>

  <p class="wp-caption-text">
    Figure 3: Create a Custom Report in Google Analytics
  </p>
</div>The resulting Custom Report will show you how many session - in total numbers, but also in percent - were served by which CloudFlare PoP. Using the "Percantage" button you can quickly generate a pie chart with the data (See Figure 4). In the example below you can see that the three most used CloudFlare PoPs for this site are San Jose, Chicago and Frankfurt (Germany).

<div id="attachment_1880" style="width: 610px" class="wp-caption aligncenter">
  <a href="/content/uploads/2015/10/CloudFlare-PoP-Utilization.png"><img src="/content/uploads/2015/10/CloudFlare-PoP-Utilization-600x288.png" alt="Figure 4: Your CloudFlare PoP utilization" width="600" height="288" class="size-large wp-image-1880" srcset="/content/uploads/2015/10/CloudFlare-PoP-Utilization-600x288.png 600w, /content/uploads/2015/10/CloudFlare-PoP-Utilization-350x168.png 350w, /content/uploads/2015/10/CloudFlare-PoP-Utilization.png 1185w" sizes="(max-width: 600px) 100vw, 600px" /></a>

  <p class="wp-caption-text">
    Figure 4: Your CloudFlare PoP utilization
  </p>
</div>

### Combining the new custom dimension with Google Analytics Data

Now that we have the CloudFlare Point-of-Presence that served a web site in Google Analytics, we can leverage this data for many more interesting reports.

One such report could be to map the location from where users connect to the CloudFlare PoPs. Figure 5 shows all 9 CloudFlare PoPs in the United States and the cities from which end-users connect to them, while accessing this blog.

<div id="attachment_1881" style="width: 610px" class="wp-caption aligncenter">
  <a href="/content/uploads/2015/10/CloudFlare-US-PoPs.png"><img src="/content/uploads/2015/10/CloudFlare-US-PoPs-600x437.png" alt="Figure 5: Geographic Reach of CloudFlare PoP for the US" width="600" height="437" class="size-large wp-image-1881" srcset="/content/uploads/2015/10/CloudFlare-US-PoPs-600x437.png 600w, /content/uploads/2015/10/CloudFlare-US-PoPs-350x255.png 350w, /content/uploads/2015/10/CloudFlare-US-PoPs.png 1400w" sizes="(max-width: 600px) 100vw, 600px" /></a>

  <p class="wp-caption-text">
    Figure 5: Geographic Reach of CloudFlare PoP for the US
  </p>
</div>In this report we can see various users not being served by the closest Point of Presence, but one farther away. This is mostly caused by the way that the Internet works and especially by some

[ISPs not peering directly](https://blog.cloudflare.com/the-relative-cost-of-bandwidth-around-the-world/) with content or CDN networks. Instead these ISP use [Tier 1 network provider](https://en.wikipedia.org/wiki/Tier_1_network), which can cause these inefficiencies.

### Summary

Google Analytics Custom dimension provide a simple way to visualize the great benefits of the global presence of your website, thanks to CloudFlare. Leverage it to see the benefits to your website, while using CloudFlare.
