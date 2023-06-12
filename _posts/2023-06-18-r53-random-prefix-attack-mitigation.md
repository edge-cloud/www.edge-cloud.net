---
title: Random prefix attack mitigation with Amazon Route 53
author: Christian Elsen
excerpt: How to mitigate random prefix attacks - when someone send a lot of traffic to subdomains of your main domain - with Amazon Route 53
layout: single
permalink: /2023/06/18/r53-random-prefix-attack-mitigation/
image: /content/uploads/2023/06/title-r53-random-prefix-attack-mitigation.png
header:
  og_image: /content/uploads/2023/06/title-r53-random-prefix-attack-mitigation.png
categories:
  - EdgeCloud
tags:
  - AWS
  - Network
  - Route-53
toc: true
toc_sticky: true
---

This blog post shows how to mitigate a random prefix attack with Amazon Route 53. While such an attack will not have an impact to performance or availability, owners of the corresponding public hosted zone will incur charges for queries to non-existing subdomains or prefixes. 

# Background

## What is a random prefix attack

With a random prefix attack someone sends large amounts of DNS queries to random subdomains (or prefixes) that most likely do not exist (e.g. "b835n0knic.edge-cloud.net, lkxmwdw13n.edge-cloud.net, ul1xx83vyq.edge-cloud.net, ..."). Nevertheless these attacks are still connnected to your domain, e.g. edge-cloud.net in the above example. 
Usually the DNS queries to these subdomains or prefixes cannot be cached by DNS resolvers, due to their randomness and that the requests are not repeated. This in return leads to the requests always reaching the authoritative nameservers. 

Rate limiting or blocking these requests based on the source address typically introduces a high amount of false positives as these attacks are usually conducted via public resolvers. Therefore these attacks are particularly effective and hard to mitigate. 

## The impact with Amazon Route 53

In the case of [Amazon Route 53](https://aws.amazon.com/route53/) as the authoritative nameserver, owners of the corresponding public hosted zone will not see an impact to performance or availability from random prefix attacks. But as Amazon Route 53 also [charges for queries](https://aws.amazon.com/route53/pricing/#Queries) to non-existing subdomains or prefixes, users will incur cost. 

## Cost model of Amazon Route 53

Having a look at the [Amazon Route 53 pricing](https://aws.amazon.com/route53/pricing/), youĺl notice that queries for a record that doesn't exist are charged at the standard rate for queries. Currently this is US$ 0.40 per million queries for the first 1 billion queries / month. 
Using the [AWS Pricing Calculator](https://calculator.aws/#/addService/Route53) you can therefore see that 1 billion queries would incur charges of US$ 400.

It's interesting and important to have a closer look at the pricing for [Alias Queries](https://aws.amazon.com/route53/pricing/#Alias_Queries). You will notice that queries to records where the alias target is an AWS resource other than another Route 53 record are free. 

From a cost perspective it would therefore be very beneficial if we could turn any query to a non-existing record into a query for an AWS resource. 

# Mitigation

For the mitigation of the random prefix attack we want to create an AWS resource that we can safely point any non-existing prefix to. Ideally we want to use a service that can perform an URL redirect in case someone just fat-fingered a valid prefix. For this use case the previous blog post [URL Redirect with Amazon CloudFront and Amazon Route 53](https://www.edge-cloud.net/2023/03/20/http-redirect-with-cloudfront/) can be re-used.

## Cloudfront distribution with wildcard name

You can follow the instructions from the previous blog post [URL Redirect with Amazon CloudFront and Amazon Route 53](https://www.edge-cloud.net/2023/03/20/http-redirect-with-cloudfront/), starting at the section [CloudFront for URL redirectPermalink](https://www.edge-cloud.net/2023/03/20/http-redirect-with-cloudfront/#cloudfront-for-url-redirect). 

The only difference is that this time you configure the alternate domain names to be ```*.edge-cloud.net``` (See Figure 1).

{% include figure image_path="/content/uploads/2023/06/r53-random-prefix-attack-mitigation-random-cloudfront-wildcard-cname.png" caption="Figure 1: CloudFront distribution with wildcard alternate domain name." %}

Everything else can remain the same. Therefore if you already have this CloudFront distribution in place, you can just change the alternate domain name. 

## Create wildcard record in Route 53

As a next step we need to setup a wildcard Alias record in Route 53. This ```*.edge-cloud.net``` record will effectively point to the CloudFront distribution created above.

[Create a new Route 53 record](https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/resource-record-sets-creating.html), where the _record name_ is *"*"* (star), the _record type_ is  *"A"*, *"Alias" is enabled, _Route traffic to_ is selected as *"Alias to CloudFront distribution"* with the above CloudFront distribution selected (See Figure 2).

{% include figure image_path="/content/uploads/2023/06/r53-random-prefix-attack-mitigation-random-r53-alias-create.png" caption="Figure 2: Route 53 wildcard record pointing to a CloudFront distribution." %}

You can repeat the same step for the _record type_ *"AAAA"* to enable IPv6 support.

## Testing the setup

Now it's time to test our setup. Let's perform a DNS query against another random subdomain or records underneath the domain in question. While previously such a query should have returned a _"NX Domain"_ response, we should now see IP addresses for CloudFront. 

And indeed that's what we will see. 

```
ubuntu@ubuntu:~$ dig +short hknk5e69s72d2l31cjuw.edge-cloud.net
65.8.158.5
65.8.158.21
65.8.158.83
65.8.158.100

```

Therefore any attacker trying to resolve random prefixes would be presented with an IP address for CloudFront. As a reminder: We won't be charged for that request as it's an Alias record where the alias target is an AWS resource other than another Route 53 record.

Next let's see what happens if we enter this random hostname into a browser.  

```
ubuntu@ubuntu:~$ curl -sS -D - https://knk5e69s72d2l31cjuw.edge-cloud.net -o /dev/null
HTTP/2 301 
server: CloudFront
date: Mon, 12 Jun 2023 00:10:39 GMT
content-length: 0
location: https://www.edge-cloud.net
x-cache: FunctionGeneratedResponse from cloudfront
via: 1.1 1943af12d816afc5bfe1ce2c8b3de416.cloudfront.net (CloudFront)
x-amz-cf-pop: SFO53-C1
alt-svc: h3=":443"; ma=86400
x-amz-cf-id: kdnl6bTnfVMSNe7uyRSKEqrqk2djdvP4g1y0XRvMkLee4Iauk8j80w==
```

Just as with the previous blog post [URL Redirect with Amazon CloudFront and Amazon Route 53](https://www.edge-cloud.net/2023/03/20/http-redirect-with-cloudfront/#testing-the-setup), we are being redirected to the website at ```https://aws.edge-cloud.net```.

# Summary

This blog post showed you how to mitigate a random prefix attack with Amazon Route 53. While such an attack will not have an impact to performance or availability, owners of the corresponding public hosted zone will incur charges for queries to non-existing subdomains or prefixes. 
By creating a wildcard CloudFront distribution along with an Amazon Route 53 wildcard record, using this CloudFront distribution as the target, cost for queries to non-existing subdomains or prefixes will be removed.