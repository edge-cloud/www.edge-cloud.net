---
title: URL Redirect with Amazon CloudFront and Amazon Route 53
author: Christian Elsen
excerpt: How to use Amazon CloudFront and Amazon Route 53 to perform a URL redirect, e.g. from http://about.example.com to http://www.example.com/about.
layout: single
image: /content/uploads/2023/03/title-url-redirect-with-cloudfront.png
header:
  og_image: /content/uploads/2023/03/title-url-redirect-with-cloudfront.png
permalink: /2023/03/20/http-redirect-with-cloudfront/
categories:
  - EdgeCloud
tags:
  - AWS
  - Network
toc: true
toc_sticky: true
---

A [URL redirect](https://en.wikipedia.org/wiki/URL_redirection), also called URL forwarding, allows you to make a web page available under more than one URL. When a web browser attempts to open a URL that has been redirected, a page with a different URL is opened. This is also indicated in the web browser itself by showing the new URL in the navigation bar. As an example: You might enter the URL ```https://about.example.com``` into the browser and be redirected to ```https://www.example.com/about/```.  

While often misunderstood as a function or DNS, a URL redirect is actually a function of a web server. Therefore if we want to implement such a redirect, we need a web server to perform such a URL redirect.

This blog post shows you how to use [Amazon CloudFront](https://aws.amazon.com/cloudfront/), the content delivery network (CDN) or AWS, to perform such a redirect.  

# Heading 1

## Heading 1.1

**Bold**

**Note:** This is a notice box
{: .notice--info}

```
#
# Amazon CloudFront function for selective URL redirect
#
function handler(event) {
    var request = event.request;
    var headers = request.headers;
    var host = request.headers.host.value;
    var newurl = `https://www.edge-cloud.net`

    switch(host) {
        case "aws.edge-cloud.net": {
            newurl = `https://www.edge-cloud.net/tags/#aws`
            break;
        }
        case "ipv6.edge-cloud.net": {
            newurl = `https://www.edge-cloud.net/tags/#ipv6`
            break;
        }
        case "tags.edge-cloud.net": {
            newurl = `https://www.edge-cloud.net/tags/`
            break;
        }
        case "about.edge-cloud.net": {
            newurl = `https://www.edge-cloud.net/about/`
            break;
        }
        default: {
            break;
        }
    }
    
    var response = {
        statusCode: 301,
        statusDescription: 'Found',
        headers:
            { "location": { "value": newurl } }
    }
    
    return response;
}

```

## Font Awesome Examples
<i class="fas fa-user"></i>
<i class="fas fa-check" style="color:green;" title="Yes"></i>
<i class="fas fa-times" style="color:red;" title="No"></i>

## Picture

{% include figure image_path="/content/uploads/2023/03/url-redirect-how-it-works.png" caption="Figure 1: Conceptional overview of a URL redirect with the DNS request and responses as well as the HTTP request and responses." %}

{% include figure image_path="/content/uploads/2023/03/url-redirect-how-sni-works.png" caption="Figure 2: The role of Server Name Indication (SNI) on a web server." %}

{% include figure image_path="/content/uploads/2023/03/url-redirect-viewer-function.png" caption="Figure 1: Selecting a CloudFront function as a Viewer Action." %}


{% include figure image_path="/content/uploads/2023/03/url-redirect-r53-setup.png" caption="Figure 2: Completed Amazon Route 53 Setup." %}

{% include figure image_path="/content/uploads/2023/03/url-redirect-r53-create-alias.png" caption="Figure 3: Creating an Amazon Route 53 Alias record." %}

{% include figure image_path="/content/uploads/2023/03/url-redirect-cloudfront-function.png" caption="Figure 3: Creating an Amazon CloudFront function." %}

{% include figure image_path="/content/uploads/2023/03/url-redirect-alternate-domain-names.png" caption="Figure 4: Configuring alternate domain names in a CloudFront distribution." %}


