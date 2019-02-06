---
id: 2555
title: AWS CloudFront meta data in Google Analytics
date: 2016-10-24T08:26:37+00:00
author: Christian Elsen
excerpt: How to use AWS Lambda and API Gateway to push visitor IP version, HTTP version and edge location information into Google Analytics.
layout: single
permalink: /2016/10/24/cloudfront-metadata-google-analytics/
redirect_from: 
  - /2016/10/24/cloudfront-metadata-google-analytics/amp/
image: /wp-content/uploads/2016/10/Analytics_07.png
categories:
  - EdgeCloud
tags:
  - AWS
  - CloudFront
  - Google-Analytics
  - HTTP2
  - IPv6
---
AWS CloudFront recently enabled support for the latest HTTP protocol version with <a href="https://aws.amazon.com/about-aws/whats-new/2016/09/amazon-cloudfront-now-supports-http2/" target="_blank">HTTP/2</a> and for the latest Internet Protocol Version with <a href="https://aws.amazon.com/blogs/aws/ipv6-support-update-cloudfront-waf-and-s3-transfer-acceleration/" target="_blank">IPv6</a>. Website owners using AWS CloudFront and having enabled HTTP/2 and/or IPv6 on their distribution might now wonder how many guests use either technology. Or you might want to know where these IPv6 users are coming from. Are they really mostly coming from Mobile networks?

This post will show you how to use some Javascript code embedded in your web-page together with a small AWS Lambda script to push information about the IP version, HTTP version and CloudFront edge location into Google Analytics for each visitor.

All necessary code can be found on GitHub under <a href="https://github.com/chriselsen/AWSLambda_CloudFrontMetaData" target="_blank">https://github.com/chriselsen/AWSLambda_CloudFrontMetaData</a>.

In a <a href="https://www.edge-cloud.net/2016/02/05/rum-light-with-cloudflare/" target="_blank">previous post</a> I&#8217;ve already shown how to achieve a similar outcome while using <a href="https://www.cloudflare.com" target="_blank">CloudFlare</a>.

### Google Analytics Custom Dimensions

In Google Analytics <a href="https://support.google.com/analytics/answer/2709828" target="_blank">custom dimensions</a> are like the default <a href="https://support.google.com/analytics/answer/1033861" target="_blank">dimensions</a>, except that you have to fill them with data.

In this case we will need to create three custom dimensions. Each will store different values for each visitor of your website.

  * **IP-Version:** This dimension will store the values &#8220;IPv4&#8221; or &#8220;IPv6&#8221;.
  * **HTTP-Version:** This dimension will store the values &#8220;2.0&#8221;, &#8220;1.1&#8221;, or &#8220;1.0&#8221;.
  * **Edge-Location:** This dimension will store the three letter <a href="https://en.wikipedia.org/wiki/International_Air_Transport_Association_airport_code" target="_blank">IATA airport code</a> of the CloudFront edge location, e.g. &#8220;SFO&#8221; for San Francisco.

### Create custom dimensions in Google Analytics

First, set up the custom dimensions in Google Analytics:

  1. Sign in to <a href="https://www.google.com/analytics/web/#home/" target="_blank">Google Analytics</a>.
  2. Select the **Admin** tab and navigate to the **property to which you want to add custom dimensions**.
  3. In the **Property** column, click **Custom Definitions**, then click **Custom Dimensions**.
  4. Click **New Custom Dimension**.
  5. Add a **Name**.

    This can be any string, but use something unique so it’s not confused with any other dimension or metric in your reports. Only you will see this name in the Google Analytics page.
  6. Select the **Scope**.

    Choose to track at the Hit, Session, User, or Product level. For this scenario I recommend to choose Hit or rather Session.
  7. Check the **Active** box to start collecting data and see the dimension in your reports right away. To create the dimension but have it remain inactive, uncheck the box.
  8. Click **Create**.
  9. Note down the dimension ID from the displayed example codes. (See Figure 1)

<div id="attachment_2558" style="width: 610px" class="wp-caption aligncenter">
  <a href="/content/uploads/2016/10/Analytics_01.png"><img src="/content/uploads/2016/10/Analytics_01-600x209.png" alt="Figure 1: Create Google Analytics Custom Dimensions" width="600" height="209" class="size-large wp-image-2558" srcset="/content/uploads/2016/10/Analytics_01-600x209.png 600w, /content/uploads/2016/10/Analytics_01-350x122.png 350w, /content/uploads/2016/10/Analytics_01-768x268.png 768w, /content/uploads/2016/10/Analytics_01.png 1108w" sizes="(max-width: 600px) 100vw, 600px" /></a>

  <p class="wp-caption-text">
    Figure 1: Create Google Analytics Custom Dimensions
  </p>
</div>

### AWS Lambda Setup

We will use a small <a href="https://aws.amazon.com/lambda/" target="_blank">AWS Lambda</a> script to extract the information about CloudFront edge location, IP version, and HTTP version from incoming requests.

The script can be found at <a href="https://github.com/chriselsen/AWSLambda_CloudFrontMetaData/blob/master/CloudFrontMetaData.nodejs" target="_blank">https://github.com/chriselsen/AWSLambda_CloudFrontMetaData/blob/master/CloudFrontMetaData.nodejs</a>.

Create a new AWS Lambda Function named &#8220;CloudFrontMetaData&#8221; and using the runtime Node.js 4.3. Use the content of the &#8220;CloudFrontMetaData.nodejs&#8221; file as the source code for Lambda and keep the Handler as &#8220;index.handler&#8221;. Create a basic execution role and increase the timeout to 10 seconds (See Figure 2).

<div id="attachment_2561" style="width: 610px" class="wp-caption aligncenter">
  <a href="/content/uploads/2016/10/Analytics_02.png"><img src="/content/uploads/2016/10/Analytics_02-600x445.png" alt="Figure 2: AWS Lambda function to extract meta data from CloudFront" width="600" height="445" class="size-large wp-image-2561" srcset="/content/uploads/2016/10/Analytics_02-600x445.png 600w, /content/uploads/2016/10/Analytics_02-350x260.png 350w, /content/uploads/2016/10/Analytics_02-768x569.png 768w, /content/uploads/2016/10/Analytics_02.png 1400w" sizes="(max-width: 600px) 100vw, 600px" /></a>

  <p class="wp-caption-text">
    Figure 2: AWS Lambda function to extract meta data from CloudFront
  </p>
</div>

Within the Script the IP-Version is inferred by looking for the character &#8220;:&#8221; in the source IP address, the IP address that CloudFront sees. If that address does include the character &#8220;:&#8221;, it is an IPv6 address, otherwise it is an IPv4 address.

The HTTP-Version information can be extracted from the <a href="https://www.w3.org/Protocols/rfc2616/rfc2616-sec14.html#sec14.45" target="_blank">&#8220;Via&#8221; header</a>, which is used by a proxy like Cloudfront to indicate the intermediate protocols.

The edge location can be determined with a reverse DNS lookup, based on the source IP address that Amazon API Gateway sees from CloudFront.

### API Gateway Setup

Next we need to make the above AWS Lambda function accessible via a URL. This can easily be done using <a href="https://aws.amazon.com/api-gateway/" target="_blank">Amazon API Gateway</a>. To simplify the setup you can use a prepared <a href="http://swagger.io/" target="_blank">swagger formatted</a> file, which can be found at <a href="https://github.com/chriselsen/AWSLambda_CloudFrontMetaData/blob/master/CloudWatchMetaData-swagger.json" target="_blank">https://github.com/chriselsen/AWSLambda_CloudFrontMetaData/blob/master/CloudWatchMetaData-swagger.json</a>

Within the file &#8220;CloudWatchMetaData-swagger.json&#8221; change the ARN on line 50 to the ARN of your Lambda function.

Create a new Amazon API Gateway using &#8220;Import from Swagger&#8221; and pasting the content of the above file.

This will automatically create the API Gateway with all it&#8217;s settings for you (See Figure 3).

<div id="attachment_2562" style="width: 610px" class="wp-caption aligncenter">
  <a href="/content/uploads/2016/10/Analytics_03.png"><img src="/content/uploads/2016/10/Analytics_03-600x228.png" alt="Figure 3: Amazon API Gateway created from Swagger definition" width="600" height="228" class="size-large wp-image-2562" srcset="/content/uploads/2016/10/Analytics_03-600x228.png 600w, /content/uploads/2016/10/Analytics_03-350x133.png 350w, /content/uploads/2016/10/Analytics_03-768x292.png 768w, /content/uploads/2016/10/Analytics_03.png 1400w" sizes="(max-width: 600px) 100vw, 600px" /></a>

  <p class="wp-caption-text">
    Figure 3: Amazon API Gateway created from Swagger definition
  </p>
</div>

Deploy the newly created API into the &#8220;Prod&#8221; stage and lookup the &#8220;Invoke URL&#8221; (See Figure 4).

<div id="attachment_2563" style="width: 610px" class="wp-caption aligncenter">
  <a href="/content/uploads/2016/10/Analytics_04.png"><img src="/content/uploads/2016/10/Analytics_04-600x67.png" alt="Figure 4: Invoke URL of the deployed API" width="600" height="67" class="size-large wp-image-2563" srcset="/content/uploads/2016/10/Analytics_04-600x67.png 600w, /content/uploads/2016/10/Analytics_04-350x39.png 350w, /content/uploads/2016/10/Analytics_04-768x86.png 768w, /content/uploads/2016/10/Analytics_04.png 1400w" sizes="(max-width: 600px) 100vw, 600px" /></a>

  <p class="wp-caption-text">
    Figure 4: Invoke URL of the deployed API
  </p>
</div>

### Cloudfront Setup

Next you need to place CloudFront in front of the API Gateway URL as the API Gateway neither supports HTTP/2 nor IPv6 at this point. Therefore we need to rely on CloudFront for this task.

The easiest approach is to create a custome path within your existing CloudFront distribution. But you could also create a separate distribution.

In both cases make sure both HTTP/2 and IPv6 are enabled for this distribution.

Within your existing CloudFront distribution create an additional origin with the API gateway Invoke URL, using &#8220;HTTPS only&#8221; for the &#8220;Origin Protocol Policy&#8221; (See Figure 5).

<div id="attachment_2565" style="width: 610px" class="wp-caption aligncenter">
  <a href="/content/uploads/2016/10/Analytics_05.png"><img src="/content/uploads/2016/10/Analytics_05-600x398.png" alt="Figure 5: Additional CloudFront origin" width="600" height="398" class="size-large wp-image-2565" srcset="/content/uploads/2016/10/Analytics_05-600x398.png 600w, /content/uploads/2016/10/Analytics_05-350x232.png 350w, /content/uploads/2016/10/Analytics_05-768x510.png 768w, /content/uploads/2016/10/Analytics_05.png 978w" sizes="(max-width: 600px) 100vw, 600px" /></a>

  <p class="wp-caption-text">
    Figure 5: Additional CloudFront origin
  </p>
</div>

Under &#8220;Behavior&#8221; of the distribution create a path pattern for a path that your are not using, e.g. &#8220;/cdn-cgi/edge-info&#8221;, while specifying the API Gateway origin.

Disable caching on this path by setting Minimum TTL, Maximum TTL, and Default TTL to 0 (See Figure 6).

<div id="attachment_2566" style="width: 581px" class="wp-caption aligncenter">
  <a href="/content/uploads/2016/10/Analytics_06.png"><img src="/content/uploads/2016/10/Analytics_06-571x600.png" alt="Figure 6: CloudFront behavior for custom path pattern" width="571" height="600" class="size-large wp-image-2566" srcset="/content/uploads/2016/10/Analytics_06-571x600.png 571w, /content/uploads/2016/10/Analytics_06-333x350.png 333w, /content/uploads/2016/10/Analytics_06-768x807.png 768w, /content/uploads/2016/10/Analytics_06.png 978w" sizes="(max-width: 571px) 100vw, 571px" /></a>

  <p class="wp-caption-text">
    Figure 6: CloudFront behavior for custom path pattern
  </p>
</div>

After the update to the CloudFront distribution has been completed you should find the following text information under the &#8220;<a href="https://www.edge-cloud.net/cdn-cgi/edge-info" target="_blank">/cdn-cgi/edge-info</a>&#8221; URL:

<pre>ipver=IPv6
httpver=2.0
edgeloc=sfo
</pre>

### Embed the Google Analytics Tracking Code

Next we need to update the Google Analytics tracking code within the website, in order to fill the newly created custom dimensions with data. This tracking code has to be placed between the code for creating the Google Analytics tracker, which looks like this: `gaTracker('create','UA-12345678-1','auto');`, and the code to submit the tracker, which looks like this `gaTracker('send','pageview');`.

If you are using WordPress the easiest way to include the custom tracking code is by using the &#8220;<a href="https://wordpress.org/plugins/google-analytics-for-wordpress/" target="_blank">Google Analytics by Yoast</a>&#8221; plugin. This plugin allows you under _Advanced > Custom Code_ to embed the below code right away and without any coding requirements.

The below JavaScript code will read the values from `/cdn-cgi/edge-info`, extract the information we are interested it and push it into the Google Analytics custom dimension variables. Ensure that the numeric IDs of these custom dimension variables matches what you have created in above steps.

Embedded the code from <https://github.com/chriselsen/AWSLambda_CloudFrontMetaData/blob/master/GoogleAnalyticsCode.js> into your website along with the standard Google Analytics tracking code. This custom JavaScript code will be executed by a visitor, collect metrics data from `/cdn-cgi/edge-info` and push it into Google Analytics.

A few hours after embedding the code you should see your first custom dimension data in Google Analytics.

### Use the custom dimension in Google Analytics

Now you can use the newly created custom in Google Analytics to find out interesting information about your visitors:

You can look at the sessions by IP-Version to figure out the percentage of IPv6 user on your website (See Figure 7).

<div id="attachment_2568" style="width: 610px" class="wp-caption aligncenter">
  <a href="/content/uploads/2016/10/Analytics_07.png"><img src="/content/uploads/2016/10/Analytics_07-600x378.png" alt="Figure 7: Sessions by IP-version" width="600" height="378" class="size-large wp-image-2568" srcset="/content/uploads/2016/10/Analytics_07-600x378.png 600w, /content/uploads/2016/10/Analytics_07-350x220.png 350w, /content/uploads/2016/10/Analytics_07-768x484.png 768w, /content/uploads/2016/10/Analytics_07.png 1037w" sizes="(max-width: 600px) 100vw, 600px" /></a>

  <p class="wp-caption-text">
    Figure 7: Sessions by IP-version
  </p>
</div>

Or you could see how many of your visitors can benefit of the improved performance of HTTP/2 over HTTP 1.1 (See Figure 8).

<div id="attachment_2569" style="width: 610px" class="wp-caption aligncenter">
  <a href="/content/uploads/2016/10/Analytics_08.png"><img src="/content/uploads/2016/10/Analytics_08-600x376.png" alt="Figure 8: Sessions by HTTP version" width="600" height="376" class="size-large wp-image-2569" srcset="/content/uploads/2016/10/Analytics_08-600x376.png 600w, /content/uploads/2016/10/Analytics_08-350x219.png 350w, /content/uploads/2016/10/Analytics_08-768x481.png 768w, /content/uploads/2016/10/Analytics_08.png 1038w" sizes="(max-width: 600px) 100vw, 600px" /></a>

  <p class="wp-caption-text">
    Figure 8: Sessions by HTTP version
  </p>
</div>

You could look at the top CloudFront edge locations serving your side (See Figure 9).

<div id="attachment_2570" style="width: 610px" class="wp-caption aligncenter">
  <a href="/content/uploads/2016/10/Analytics_09.png"><img src="/content/uploads/2016/10/Analytics_09-600x339.png" alt="Figure 9: Hits and Sessions by Edge-Location" width="600" height="339" class="size-large wp-image-2570" srcset="/content/uploads/2016/10/Analytics_09-600x339.png 600w, /content/uploads/2016/10/Analytics_09-350x198.png 350w, /content/uploads/2016/10/Analytics_09-768x434.png 768w, /content/uploads/2016/10/Analytics_09.png 1042w" sizes="(max-width: 600px) 100vw, 600px" /></a>

  <p class="wp-caption-text">
    Figure 9: Hits and Sessions by Edge-Location
  </p>
</div>

While having a look at which cities your IPv6 enabled visitors are coming from, you will notice that AWS CloudFront has not yet completed the turn up of all ASNs (See Figure 10).

<div id="attachment_2572" style="width: 610px" class="wp-caption aligncenter">
  <a href="/content/uploads/2016/10/Analytics_10-1.png"><img src="/content/uploads/2016/10/Analytics_10-1-600x348.png" alt="Figure 10: Location of IPv6 visitors" width="600" height="348" class="size-large wp-image-2572" srcset="/content/uploads/2016/10/Analytics_10-1-600x348.png 600w, /content/uploads/2016/10/Analytics_10-1-350x203.png 350w, /content/uploads/2016/10/Analytics_10-1-768x445.png 768w, /content/uploads/2016/10/Analytics_10-1.png 1400w" sizes="(max-width: 600px) 100vw, 600px" /></a>

  <p class="wp-caption-text">
    Figure 10: Location of IPv6 visitors
  </p>
</div>

### Summary

This article has shown you, that you can easily built your own Real User Monitoring system with Google Analytics Custom dimensions, some simple JavaScript code and AWS Lambda. It allows you to extract many interesting metrics out of your CloudFront usage and make it available in Google Analytics for further data analysis.
