---
title: '"Breaking" Amazon AWS S3'
date: 2013-06-21T21:09:31+00:00
author: Christian Elsen
excerpt: While working with Amazon AWS S3 it turned out, that it allows users to specify S3 bucket names in the "US Standard" regions that are not allowed like this in any other zone. As most libraries building on top of S3 assume the naming restrictions for all non-"US Standard" regions are also enforced in "US Standard", this breaks quite a bit of things.
layout: single
permalink: /2013/06/21/breaking-amazon-aws-s3/
redirect_from:
  - /2013/06/21/breaking-amazon-aws-s3/amp/
categories:
  - EdgeCloud
tags:
  - AWS
toc: true
toc_sticky: true
---
I have used various services from [Amazon AWS](https://aws.amazon.com/) for quite a while now and have always been amazed by what interesting things one can do with this services. Recently I took the AWS training course [Architecting on AWS](https://www.edge-cloud.net/2014/03/11/architecture-design-vsphere-ipv6/), which gives an awesome overview on what's possible with the AWS service.

During the training some of the participants had quite some trouble with one of the hands-on exercises. As my exercise worked without a flaw, I used the time and started digging deeper what could be wrong. Turns out that [Amazon AWS S3](https://aws.amazon.com/s3/) allows users to specify S3 bucket names in the "US Standard" regions that are not allowed like this in any other zone. As most libraries building on top of S3 assume the naming restrictions for all non-"US Standard" regions are also enforced in "US Standard", it breaks functionality of some of these libraries.

Let's have a closer look:

# Creating an S3 bucket outside "US Standard"

When creating an S3 bucket outside "US Standard" neither the S3 Management Console nor the underlying REST API accepts the name to contain upper case letters. Figure 1 shows an example of the error message in the Console.

{% include figure image_path="/content/uploads/2013/06/Capture09.png" caption="Figure 1: Upper case letters are not allowed in S3 bucket names in the Oregon region" %}

This behavior makes sense as the above bucket name would become reachable under the URL *http://ThisBucketWillLiveInOregon.s3.amazonaws.com/* which is equivalent to e.g. *http://thisbucketwillliveinoregon.s3.amazonaws.com/*. On this topic [RFC1035](https://www.ietf.org/rfc/rfc1035.txt) notes: *Note that while upper and lower case letters are allowed in domain names, no significance is attached to the case. That is, two names with the same spelling but different case are to be treated as if identical.*

# Creating an S3 bucket in "US Standard"

For S3 buckets created in the AWS region "US Standard", things look a bit different. As Figure 2 shows, it is very well possible to create two buckets with the same name, that only differentiate in case.

{% include figure image_path="/content/uploads/2013/06/Capture02.png" caption="Figure 2: The *US Standard* region differentiates case in S3 bucket names" %}

On a first glimpse that isn't that bad, as in contrary to other regions, buckets in the "US Standard" region are mapped to the URL http://s3.amazonaws.com/<Bucket Name>/. And here there is indeed a difference between the URL _"http://s3.amazonaws.com/DifferentiateBetweenUPPERcaseANDlowerCASE"_ and the folder _"http://s3.amazonaws.com/DifferentiateBetweenupperCASEANDLOWERCASE"_.

# Where the problems start

One problem starts when you want to use that bucket in the "US Standard" region for static website hosting. As Figure 3 shows, attempting to enable website hosting for an S3 bucket in the "US Standard" region that uses upper case letters will fail. Unfortunately the error message is quite useless. Here Amazon AWS should provide better feedback through a useful error message.

{% include figure image_path="/content/uploads/2013/06/Capture08_SMall.png" caption="Figure 3: Website hosting for an S3 bucket in the region *US Standard* fails" %}

Yet again, this also makes sense: The above S3 bucket would be hosted under the URL *http://DifferentiateBetweenUPPERcaseANDlowerCASE.s3-website-us-east-1.amazonaws.com* which according to RFC1035 doesn't differ from *http://DifferentiateBetweenupperCASEANDLOWERCASE.s3-website-us-east-1.amazonaws.com* which the other bucket - that we previously created - would receive. Thus two buckets would receive the same URL. That clearly shouldn't happen.

# Why does it matter?

Turns out that some libraries for making the S3 REST API available in various programming languages do not take into consideration that "US Standard" allows mixed case S3 buckets. The Python interface to Amazon Web Services "[boto](https://aws.amazon.com/sdk-for-python/)" for example assumes that bucket names are always in lower case. Using a bucket with a mixed case name will break uploads and thereby the functionality of the library.

That's exactly what happened with other members of the training course: Their bucket name used non-lower case letters, breaking the provided Python script.

# It's all in the documentation

At the same time, the Amazon AWS documentation is pretty extensive and does mention the above special cases. Although one has to say that they are "well hidden".

In the Amazon S3 Developer Guide, the section "[Bucket Restrictions and Limitations](https://docs.aws.amazon.com/AmazonS3/latest/dev/BucketRestrictions.html)" clearly states that in all regions except for the US Standard region a bucket name must comply with certain rules, that will result in a DNS compliant bucket name. While the rules for bucket names in the US Standard region are similar but less restrictive and can result in a bucket name that is not DNS-compliant.

The section "[Virtual Hosting of Buckets](https://docs.aws.amazon.com/AmazonS3/latest/dev/VirtualHosting.html)" in the same guide then also states that only lower-case buckets are addressable using the virtual hosting method.

While it's great that the documentation clearly mentions the restrictions, as an end-user I would prefer consistency between the regions and better error messages.
