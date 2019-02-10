---
id: 1657
title: TYPO3 with Cloudflare
date: 2015-07-20T15:38:13+00:00
author: Christian Elsen
excerpt: "Cloudflare is an ideal and free addition for anyone running a website. And while Typo3 doesn't work smoothly with Cloudflare out of the box, it is trivial to change this with a few small changes."
layout: single
permalink: /2015/07/20/typo3-with-cloudflare/
redirect_from: 
  - /2015/07/20/typo3-with-cloudflare/amp/
categories:
  - EdgeCloud
tags:
  - Cloudflare
---
<a href="https://www.cloudflare.com/" target="_blank">Cloudflare</a> provides a content delivery network and distributed domain name server services to help secure and accelerate websites. This cloud-based service sits between the visitor and the CloudFlare user's hosting provider, acting as a reverse proxy for the website. While the majority of web content management systems have no problem with such an approach out of the box, TYPO3 is different. There are some minor settings that need to be changed for this combination to work. This article will show you how to accomplish this.



<div id="attachment_1658" style="width: 530px" class="wp-caption aligncenter">
  <img src="/content/uploads/2015/07/Speed-Up-and-Protect-Your-website-with-CloudFlare-02-520x294.jpg" alt="Figure 1: Speed-up and protect your website with CloudFlare" width="520" height="294" class="size-full wp-image-1658" srcset="/content/uploads/2015/07/Speed-Up-and-Protect-Your-website-with-CloudFlare-02-520x294.jpg 520w, /content/uploads/2015/07/Speed-Up-and-Protect-Your-website-with-CloudFlare-02-520x294-360x204.jpg 360w" sizes="(max-width: 520px) 100vw, 520px" />

  <p class="wp-caption-text">
    Figure 1: Speed-up and protect your website with CloudFlare
  </p>
</div>

<a href="https://typo3.org/" target="_blank">TYPO3</a> is a free and open source web content management system written in PHP, which is more widespread in Europe than in other regions. The biggest market share can be found in German-speaking countries.

## Support for HTTPS

Out of the box Cloudflare provides free SSL support for every website, allowing user to provide HTTPS for their website. This offering is called <a href="https://blog.cloudflare.com/introducing-universal-ssl/" target="_blank">UniversalSSL</a> and it can be used without the origin web server even supporting SSL.

As a result you could access a website like example.com under http://www.example.com as well as https://www.example.com.

Most content management system allow a website to be accessed both via HTTP and HTTPS by using relative links to include content, such as style sheets or images. TYPO3 unfortunately traditionally uses absolute URLs, which leads to a broken website when visiting a TYPO3 instance that was setup for HTTP via HTTPS or vice versa.

While this has been fixed in newer version of TYPO3, this legacy behavior can still be found in older versions or after upgrades where the configuration wasn't adapted accordingly.

It is very easy and straight forward to change this behavior though. Doing so will instruct TYPO3 to change the Base URL depending on how the content was accessed via Cloudflare, acting as a Reverse Proxy. This means that if an end-user connects to a website via Cloudflare and HTTPS, the Base URL in TYPO3 will include https://, even though the origin server was contacted via HTTP by Cloudflare.

Use the following Typoscript with Condition inside your main template.

> config.baseURL = http://www.example.com/

> [globalString = ENV:HTTP\_X\_FORWARDED_PROTO=https, ENV:HTTPS=on]

> config.baseURL = https://www.example.com/

> [global]

Don't forget to change the sample URL www.example.com with your actual domain.

The better alternative would be to use the more current <a href="https://buzz.typo3.org/people/soeren-malling/article/baseurl-is-dead-long-live-absrefprefix/" target="_blank">config.absRefPrefix</a> capability instead of the legacy config.baseURL. This configuration item would instruct TYPO3 to use relative URLs instead of absolute URLs.

Ideally you should configure your origin web server with an SSL certificate to enable HTTPS between Cloudflare and your server. For this it is sufficient to use a self-signed certificate.

Also after enabling TYPO3 for UniversalSSL, you can <a href="https://support.cloudflare.com/hc/en-us/articles/200170536-How-do-I-redirect-all-visitors-to-HTTPS-SSL-" target="_blank">force usage of HTTPS</a> on all your pages.

## Support for the TYPO3 backend

The TYPO3 backend is another troublemaker in combination with a reverse proxy such as Cloudflare. In older versions the backend would only display a blank page after successful login. While this error has been corrected in recent versions, another challenge arises when using the backend via HTTPS. As mentioned earlier, with Cloudflare you can access your backend via HTTPS over Cloudflare as a reverse proxy, without requiring your origin server to support HTTPS. Unfortunately in this case TYPO3 will always attempt to switch back to HTTP as the backend was contacted by Cloudflare via HTTP.

But there is also an easy fix for this behavior. TYPO3 allows the configuration of an SSL Proxy, which is what Cloudflare basically behaves as here.

Just add the following entries to your _typo3conf/localconf.php_ file.

> $GLOBALS\['TYPO3\_CONF\_VARS'\]\['SYS'\]['reverseProxyIP'] = '*';

> $GLOBALS\['TYPO3\_CONF\_VARS'\]\['SYS'\]['reverseProxyHeaderMultiValue'] = 'first';

> $GLOBALS\['TYPO3\_CONF\_VARS'\]\['SYS'\]['reverseProxySSL'] = '*';

> $GLOBALS\['TYPO3\_CONF\_VARS'\]\['SYS'\]['trustedHostsPattern'] = '(www.)?example.com';

Don't forget to change the sample URL www.example.com with your actual domain.

## CloudFlare extension for TYPO3

While not mandatory to operate CloudFlare with a TYPO3 based website, it is highly recommended to use the <a href="https://typo3.org/extensions/repository/view/cloudflare" target="_blank">CloudFlare extension</a> for TYPO3. This excellent extension allows you to flush the CloudFlare cache, restores the origin IP address of the end-user towards TYPO3 and takes care of the above mentioned SSL setup transparently.

## Summary

Cloudflare is an ideal and free addition for anyone running a website. And while especially older TYPO3 installs might not work smoothly with Cloudflare out of the box, it is trivial to change this with a few small changes.
