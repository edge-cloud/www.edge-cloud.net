---
id: 2140
title: 'RUM "Light" with CloudFlare and Google Analytics'
date: 2016-02-05T08:00:31+00:00
author: Christian Elsen
excerpt: Would you like to know the ratio of visitors accessing your website over IPv4 vs. IPv6? Or curious about how many visitors you serve over HTTP/2 vs. SPDY or HTTP 1.1? Using Google Analytics, CloudFlare and some JavaScript magic we can easily get answers to these questions. For this we will use the principle of Real User Monitoring (RUM).
layout: single
permalink: /2016/02/05/rum-light-with-cloudflare/
redirect_from: 
  - /2016/02/05/rum-light-with-cloudflare/amp/
categories:
  - EdgeCloud
tags:
  - Cloudflare
  - Google-Analytics
  - HTTP2
  - IPv6
---
Would you like to know the ratio of visitors accessing your website over IPv4 vs. IPv6? Or curious about how many visitors you serve over HTTP/2 vs. SPDY or HTTP 1.1?

Using Google Analytics, CloudFlare and some JavaScript magic we can easily get answers to these questions. For this we will use the principle of [Real User Monitoring (RUM)](https://en.wikipedia.org/wiki/Real_user_monitoring).

In a [previous post](https://www.edge-cloud.net/2015/10/04/cloudflare-pops-in-google-analytics/) I've already shown how we can track the usage of CloudFlare data centers for the delivery of our website in Google Analytics. In this blog post I want to show you how to refine this method even further and also include information about other interesting metrics, such as IPv6 and HTTP/2 usage .

### Possible custom dimensions

In the [previous post](https://www.edge-cloud.net/2015/10/04/cloudflare-pops-in-google-analytics/) I used response header information, presented by the CloudFlare edge servers to extract information about the served traffic.

This time we will instead use a [special debugging URL](https://support.cloudflare.com/hc/en-us/articles/200169986-Which-CloudFlare-data-center-do-I-reach-) that is available for all CloudFlare powered sites. It is available under `https://www.example.com/cdn-cgi/trace`, where `https://www.example.com/` corresponds to the CloudFlare powered domain.

The result will look like this:

<pre>fl=4f96
h=www.cloudflare.com
ip=2606:4700:1000:8200:7847:642:dc8e:b176
ts=1454615047.969
visit_scheme=https
uag=Mozilla/5.0 (Windows NT 6.3; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/48.0.2564.103 Safari/537.36
colo=SJC
spdy=h2
loc=US
</pre>

Let's have a closer look at the fields that are interesting to us and what they mean:

  * **ip:** This lists the IP address that was used to contact CloudFlare for this request. We can use this value to determine whether the request was made over IPv4 or IPv6.
  * **visit_scheme:** This will tell you whether the request was made over HTTP or HTTPS. In case you serve traffic only over HTTPS, this is rather not interesting. Otherwise you could use it to determine the traffic split between visitor using an encrypted vs. un-encrypted connection.
  * **colo:** The CloudFlare Points-of-Presence (PoP), which served this traffic. In the [previous post](https://www.edge-cloud.net/2015/10/04/cloudflare-pops-in-google-analytics/) you have already seen how to use this.
  * **spdy:** The HTTP protocol version that was used to serve this content. Even though the key is called "spdy", the value can also indicate HTTP/2 via "h2" (as depicted above). A value of "3.1" will indicate SPDY/3.1 and "off" will indicate HTTP 1.x.

    It would make more sense to have the field "http" available with "http=h2" for HTTP/2, "http=spdy/3.1" for SPDY/3.1, and "http=http/1.x" for HTTP/1.x. But for now the "spdy" field is good enough.
  * **loc:** The country that CloudFlare located the visitor in. This information is already available in Google Analytics, we therefore do not need to extract it here.

### How does Real User Monitoring fit into the picture?

Now that we know about all this great data at `/cdn-cgi/trace` for our website, how can we make this accessible in Google Analytics? Especially while keeping in mind, that this data is only available for the current connection and differs from user to user.

The trick: We make the user download the data, extract the values and push the results into Google Analytics.

This approach of leveraging a real user to measure or monitor something is called [Real User Monitoring](https://en.wikipedia.org/wiki/Real_user_monitoring) or RUM for short.

<div id="attachment_2149" style="width: 610px" class="wp-caption aligncenter">
  <a href="/content/uploads/2016/02/RUM-Flowchart.png" rel="attachment wp-att-2149"><img class="size-large wp-image-2149" src="/content/uploads/2016/02/RUM-Flowchart-600x365.png" alt="Figure 1: Interaction between browser, CloudFlare and Google Analytics" width="600" height="365" srcset="/content/uploads/2016/02/RUM-Flowchart-600x365.png 600w, /content/uploads/2016/02/RUM-Flowchart-350x213.png 350w, /content/uploads/2016/02/RUM-Flowchart-768x467.png 768w, /content/uploads/2016/02/RUM-Flowchart.png 943w" sizes="(max-width: 600px) 100vw, 600px" /></a>

  <p class="wp-caption-text">
    Figure 1: Interaction between browser, CloudFlare and Google Analytics
  </p>
</div>

The workflow that will be execute on every page load is as follows (See Figure 1):

  * **Step 1:** A user requests a page via his or her browser.
  * **Step 2:** The content is returned and includes a JavaScript to be executed by the browser.
  * **Step 3:** The JavaScript requests the content from /cdn-cgi/trace.
  * **Step 4:** The different values for that particular visitor and browsing session are returned to the JavaScript.
  * **Step 5:** The JavaScript pushes the values as custom dimension into Google Analytics.

The additional request of the browser to `/cdn-cgi/trace` is similar to the browser loading stylesheets or images for rendering a page. This added round-trip to the closest CloudFlare edge for one more element does not impact the performance of the site.

### Create custom dimensiosn in Google Analytics

For each value from `/cdn-cgi/trace` that we want to track, we need to create a custom dimension in Google Analytics. Here is an example mapping for the values that we want to track in this blog post:

  * dimension1: CloudFlare PoP location
  * dimension2: Access Scheme (HTTPS vs. HTTP)
  * dimension3: IP Transport Method (IPv4 vs. IPv6)
  * dimension4: HTTP version (HTTP 1.1 vs. SPDY vs. HTTP/2)

First, set up the custom dimensions in Google Analytics:

  1. Sign in to [Google Analytics](https://www.google.com/analytics/web/#home/).
  2. Select the **Admin** tab and navigate to the **property to which you want to add custom dimensions**.
  3. In the **Property** column, click **Custom Definitions**, then click **Custom Dimensions**.
  4. Click **New Custom Dimension**.
  5. Add a **Name**. This can be any string, but use something unique so it’s not confused with any other dimension or metric in your reports. Only you will see this name in the Google Analytics page.
  6. Select the **Scope**. Choose to track at the Hit, Session, User, or Product level. For this scenario I recommend to choose Hit or rather Session.
  7. Check the **Active** box to start collecting data and see the dimension in your reports right away. To create the dimension but have it remain inactive, uncheck the box.
  8. Click **Create**.
  9. Note down the dimension ID from the displayed example codes. In the example for this blog post the dimension IDs are listed above for the three monitored values.

<div id="attachment_2143" style="width: 610px" class="wp-caption aligncenter">
  <a href="/content/uploads/2016/02/RUM_01.png" rel="attachment wp-att-2143"><img class="size-large wp-image-2143" src="/content/uploads/2016/02/RUM_01-600x209.png" alt="Figure 2: Create a Google Analytics Custom Dimension" width="600" height="209" srcset="/content/uploads/2016/02/RUM_01-600x209.png 600w, /content/uploads/2016/02/RUM_01-350x122.png 350w, /content/uploads/2016/02/RUM_01-768x268.png 768w, /content/uploads/2016/02/RUM_01.png 1108w" sizes="(max-width: 600px) 100vw, 600px" /></a>

  <p class="wp-caption-text">
    Figure 2: Create a Google Analytics Custom Dimension
  </p>
</div>

### Embed the Google Analytics Tracking Code

Next we need to embed the Google Analytics tracking code within the website, in order to fill the newly created custom dimensions with data. This tracking code has to be placed between the code for creating the Google Analytics tracker, which looks like this: `__gaTracker('create','UA-12345678-1','auto');`, and the code to submit the tracker, which looks like this `__gaTracker('send','pageview');`.

If you are using WordPress the easiest way to include the custom tracking code is by using the "[Google Analytics by Yoast](https://wordpress.org/plugins/google-analytics-for-wordpress/)" plugin. This plugin allows you under _Advanced > Custom Code_ to embed the below code right away and without any coding requirements.

The below JavaScript code will read the values from `/cdn-cgi/trace`, extract the information we are interested it and push it into the Google Analytics custom dimension variables. Ensure that the numeric IDs of these custom dimension variables matches what you have created in above steps.

<pre>function processData(x) {
  var y = {};
  for (var i = 0; i &lt; x.length-1; i++) {
    var split = x[i].split('=');
    y[split[0].trim()] = split[1].trim();
  }
  return y;
}

function objData(x) {
  return obj[x];
}

function isIPv6() {
  ipv6 = (objData('ip').indexOf(":") &gt; -1);
  switch (ipv6){
    case true:
      return "IPv6";
      break;
    default:
      return "IPv4";
  }
}

var data;
var obj;
var client = new XMLHttpRequest();
client.open("GET", "/cdn-cgi/trace", false);
client.onreadystatechange =
        function () {
                if(client.readyState === 4){
                        if(client.status === 200 || client.status == 0){
                                data = client.responseText.split("\n");
                        }
                }
        };
client.send(null);
obj= processData(data);

__gaTracker('set','dimension1',objData('colo'));
__gaTracker('set','dimension2',isIPv6());
__gaTracker('set','dimension3',objData('spdy'));
</pre>

Embedded in your website along with the standard Google Analytics tracking code, this custom JavaScript code will be executed by a visitor, collect metrics data from `/cdn-cgi/trace` and push it into Google Analytics.

A few hours after embedding the code you should see your first custom dimension data in Google Analytics.

### Create custom reports in Google Analytics

You can now create custom reports with the custom dimensions in Google Analytics. A simple example would be to determine the IPv4 vs. IPv6 traffic ratio.

  1. Make sure you are still signed in to [Google Analytics](https://www.google.com/analytics/web/#home/).
  2. Select the **Customization** tab and click on **New Custom Report**.
  3. **Name** your Custom Report here.
  4. Select a Metric for which you want to see your Custom Dimensions. I recommend the metric "Sessions" within the "Users" Metric Group.
  5. Next select the custom dimension for the IP Transport Method (IPv4 vs. IPv6), that you created as the "Dimension Drilldown" (See Figure 3).
  6. Click on the **Save** button.

<div id="attachment_2145" style="width: 537px" class="wp-caption aligncenter">
  <a href="/content/uploads/2016/02/RUM_02.png" rel="attachment wp-att-2145"><img class="size-large wp-image-2145" src="/content/uploads/2016/02/RUM_02-527x600.png" alt="Figure 3: Create a Custom Report in Google Analytics" width="527" height="600" srcset="/content/uploads/2016/02/RUM_02-527x600.png 527w, /content/uploads/2016/02/RUM_02-307x350.png 307w, /content/uploads/2016/02/RUM_02.png 661w" sizes="(max-width: 527px) 100vw, 527px" /></a>

  <p class="wp-caption-text">
    Figure 3: Create a Custom Report in Google Analytics
  </p>
</div>

The resulting Custom Report will show you how many session - in total numbers, but also in percent - were served by which transport method.

<div id="attachment_2146" style="width: 610px" class="wp-caption aligncenter">
  <a href="/content/uploads/2016/02/RUM_03.png" rel="attachment wp-att-2146"><img class="size-large wp-image-2146" src="/content/uploads/2016/02/RUM_03-600x503.png" alt="Figure 4: Traffic served over IPv4 vs. IPv6" width="600" height="503" srcset="/content/uploads/2016/02/RUM_03-600x503.png 600w, /content/uploads/2016/02/RUM_03-350x294.png 350w, /content/uploads/2016/02/RUM_03-768x644.png 768w, /content/uploads/2016/02/RUM_03.png 936w" sizes="(max-width: 600px) 100vw, 600px" /></a>

  <p class="wp-caption-text">
    Figure 4: Traffic served over IPv4 vs. IPv6
  </p>
</div>

You can generate similar graphs for the other custom dimensions. E.g. in order to find out how much of your web-sites traffic was served over HTTP/2 (See Figure 5).

<div id="attachment_2147" style="width: 610px" class="wp-caption aligncenter">
  <a href="/content/uploads/2016/02/RUM_04.png" rel="attachment wp-att-2147"><img class="size-large wp-image-2147" src="/content/uploads/2016/02/RUM_04-600x467.png" alt="Figure 5: Traffic served over HTTP/2 vs. SPDY vs. HTTP 1.x" width="600" height="467" srcset="/content/uploads/2016/02/RUM_04-600x467.png 600w, /content/uploads/2016/02/RUM_04-350x272.png 350w, /content/uploads/2016/02/RUM_04-768x598.png 768w, /content/uploads/2016/02/RUM_04.png 969w" sizes="(max-width: 600px) 100vw, 600px" /></a>

  <p class="wp-caption-text">
    Figure 5: Traffic served over HTTP/2 vs. SPDY vs. HTTP 1.x
  </p>
</div>

By combining data from the custom dimension with data collected by Google Analytcis natively you can answer many interesting questions for your website, such as: Is IPv6 traffic really mostly driven by mobile traffic? Where are all these users with HTTP/2 capable browsers located?

### Summary

This article has shown you, that you can easily built your own Real User Monitoring system with Google Analytics Custom dimension and some JavaScript code. It allows you to extract many interesting metrics out of your CloudFlare usage and make it available in Google Analytics for further data analysis.

Not only has this site been using the above described method since November 2015, but also another [HTTP/2 adoption](https://www.cloudflare.com" target="_blank">well-known site</a>, which has provided <a href="https://blog.cloudflare.com/introducing-http2/" target="_blank">interesting insights</a> into the <a href="https://blog.cloudflare.com/cloudflares-impact-on-the-http-2-universe/).
