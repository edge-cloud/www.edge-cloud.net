---
id: 361
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
---
I have used various services from <a href="https://aws.amazon.com/" target="_blank">Amazon AWS</a> for quite a while now and have always been amazed by what interesting things one can do with this services. Recently I took the AWS training course "<a href="https://www.edge-cloud.net/2014/03/11/architecture-design-vsphere-ipv6/" target="_blank">Architecting on AWS</a>", which gives an awesome overview on what's possible with the AWS service.

During the training some of the participants had quite some trouble with one of the hands-on exercises. As my exercise worked without a flaw, I used the time and started digging deeper what could be wrong. Turns out that <a href="https://aws.amazon.com/s3/" target="_blank">Amazon AWS S3</a> allows users to specify S3 bucket names in the "US Standard" regions that are not allowed like this in any other zone. As most libraries building on top of S3 assume the naming restrictions for all non-"US Standard" regions are also enforced in "US Standard", it breaks functionality of some of these libraries.

Let's have a closer look:

**Creating an S3 bucket outside "US Standard"**

When creating an S3 bucket outside "US Standard" neither the S3 Management Console nor the underlying REST API accepts the name to contain upper case letters. Figure 1 shows an example of the error message in the Console.



<div id="attachment_362" style="width: 742px" class="wp-caption aligncenter">
  <img src="/content/uploads/2013/06/Capture09.png" alt="Figure 1: Upper case letters are not allowed in S3 bucket names in the Oregon region." width="732" height="323" class="size-full wp-image-362" srcset="/content/uploads/2013/06/Capture09.png 732w, /content/uploads/2013/06/Capture09-500x220.png 500w" sizes="(max-width: 732px) 100vw, 732px" />

  <p class="wp-caption-text">
    <br />Figure 1: Upper case letters are not allowed in S3 bucket names in the Oregon region.
  </p>
</div>

This behavior makes sense as the above bucket name would become reachable under the URL _"http://ThisBucketWillLiveInOregon.s3.amazonaws.com/"_ which is equivalent to e.g. _"http://thisbucketwillliveinoregon.s3.amazonaws.com/"_. On this topic <a href="https://www.ietf.org/rfc/rfc1035.txt" target="_blank">RFC1035</a> notes: _"Note that while upper and lower case letters are allowed in domain names, no significance is attached to the case. That is, two names with the same spelling but different case are to be treated as if identical."_

**Creating an S3 bucket in "US Standard"**

For S3 buckets created in the AWS region "US Standard", things look a bit different. As Figure 2 shows, it is very well possible to create two buckets with the same name, that only differentiate in case.

<div id="attachment_365" style="width: 441px" class="wp-caption aligncenter">
  <img src="/content/uploads/2013/06/Capture02.png" alt="Figure 2: The &quot;US Standard&quot; region differentiates case in S3 bucket names." width="431" height="336" class="size-full wp-image-365" />

  <p class="wp-caption-text">
    <br />Figure 2: The "US Standard" region differentiates case in S3 bucket names.
  </p>
</div>

On a first glimpse that isn't that bad, as in contrary to other regions, buckets in the "US Standard" region are mapped to the URL http://s3.amazonaws.com/<Bucket Name>/. And here there is indeed a difference between the URL _"http://s3.amazonaws.com/DifferentiateBetweenUPPERcaseANDlowerCASE"_ and the folder _"http://s3.amazonaws.com/DifferentiateBetweenupperCASEANDLOWERCASE"_.

**Where the problems start**

One problem starts when you want to use that bucket in the "US Standard" region for static website hosting. As Figure 3 shows, attempting to enable website hosting for an S3 bucket in the "US Standard" region that uses upper case letters will fail. Unfortunately the error message is quite useless. Here Amazon AWS should provide better feedback through a useful error message.

<div id="attachment_366" style="width: 910px" class="wp-caption aligncenter">
  <img src="/content/uploads/2013/06/Capture08_SMall.png" alt="Figure 3: Website hosting for an S3 bucket in the region &quot;US Standard&quot; fails." width="900" height="374" class="size-full wp-image-366" srcset="/content/uploads/2013/06/Capture08_SMall.png 900w, /content/uploads/2013/06/Capture08_SMall-500x207.png 500w" sizes="(max-width: 900px) 100vw, 900px" />

  <p class="wp-caption-text">
    <br />Figure 3: Website hosting for an S3 bucket in the region "US Standard" fails.
  </p>
</div>

Yet again, this also makes sense: The above S3 bucket would be hosted under the URL _"http://DifferentiateBetweenUPPERcaseANDlowerCASE.s3-website-us-east-1.amazonaws.com"_ which according to RFC1035 doesn't differ from _"http://DifferentiateBetweenupperCASEANDLOWERCASE.s3-website-us-east-1.amazonaws.com"_ which the other bucket - that we previously created - would receive. Thus two buckets would receive the same URL. That clearly shouldn't happen.

**Why does it matter?**

Turns out that some libraries for making the S3 REST API available in various programming languages do not take into consideration that "US Standard" allows mixed case S3 buckets. The Python interface to Amazon Web Services "<a href="https://aws.amazon.com/sdk-for-python/" target="_blank">boto</a>" for example assumes that bucket names are always in lower case. Using a bucket with a mixed case name will break uploads and thereby the functionality of the library.

That's exactly what happened with other members of the training course: Their bucket name used non-lower case letters, breaking the provided Python script.

**It's all in the documentation**

At the same time, the Amazon AWS documentation is pretty extensive and does mention the above special cases. Although one has to say that they are "well hidden".

In the Amazon S3 Developer Guide, the section "<a href="https://docs.aws.amazon.com/AmazonS3/latest/dev/BucketRestrictions.html" target="_blank">Bucket Restrictions and Limitations</a>" clearly states that in all regions except for the US Standard region a bucket name must comply with certain rules, that will result in a DNS compliant bucket name. While the rules for bucket names in the US Standard region are similar but less restrictive and can result in a bucket name that is not DNS-compliant.

The section "<a href="https://docs.aws.amazon.com/AmazonS3/latest/dev/VirtualHosting.html" target="_blank">Virtual Hosting of Buckets</a>" in the same guide then also states that only lower-case buckets are addressable using the virtual hosting method.

While it's great that the documentation clearly mentions the restrictions, as an end-user I would prefer consistency between the regions and better error messages.
