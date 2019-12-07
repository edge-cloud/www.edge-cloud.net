---
title: Block access from certain countries with Route 53 Geolocation
author: Christian Elsen
excerpt: Use Amazon Route 53 Geolocation Routing to block access to services from certain countries. Leverage RIPE Atlas to validate the setup.
layout: single
permalink: /2019/12/06/block-countries-with-route53/
categories:
  - EdgeCloud
tags:
  - AWS
  - Network
toc: true
---

This article walks you through using [Amazon Route 53 Geolocation Routing](https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/routing-policy.html#routing-policy-geo), in order to block access to services from certain countries. In addition [RIPE Atlas](https://atlas.ripe.net/) is used in a subsequent step to validate the setup.

# Motivation

There are multiple reasons why you might want to block access to your website or API from a certain countries. If you are a US based company, you are required to comply with [US regulations regarding sanctions](https://www.bis.doc.gov/index.php/policy-guidance/country-guidance/sanctioned-destinations) against countries such as Cuba, Iran, North Korea, Sudan, or Syria.

Another motivation could be to prevent illicit traffic from countries that you do not conduct business with. Especially China and Russia are known to be a prime source of illicit traffic.

# Configuration setup

Here, we are using [Amazon Route 53 Geolocation Routing](https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/routing-policy.html#routing-policy-geo) to direct traffic from China for one or multiple domain names to either an invalid target IP or a static error page.

Using an invalid IP address, such as a Loopback address like 127.0.0.1 would cause traffic destined for web site or API not to even reach your or your provider's network.

## Route 53 Geolocation routing

In this setup we solely create a DNS test entry to validate functionality of [Amazon Route 53 Geolocation Routing](https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/routing-policy.html#routing-policy-geo) for our desired purpose. We will do so by creating a DNS entry of the type "TXT", that will respond with "China", when queried from within China, and with "Default" when queried from all other countries.

Geolocation works by mapping IP addresses to locations. However, some IP addresses aren't mapped to geographic locations, so even if you create geolocation records that cover all seven continents, Amazon Route 53 will receive some DNS queries from locations that it can't identify. These locations are mapped to the default record. This default record handles both queries from IP addresses that aren't mapped to any location and queries that come from locations that you haven't created geolocation records for.

First we create a Route 53 record for the hostname "geoblock" of the type "TXT" (See Figure 1). As depicted the routing policy is specified as "Geolocation", with the location of "China". The value for this record is "China".

{% include figure image_path="/content/uploads/2019/12/GeoBlock_China.jpg" caption="Figure 1: Create TXT record with a 'Geolocation' routing policy for the origin country 'China'." %}

Next, we create another Route 53 for the same hostname of "geoblock" and the type "TXT" (See Figure 2). As depicted the routing policy is also specified as "Geolocation". But this time the location is configured as "Default" with the record value being "Default".

{% include figure image_path="/content/uploads/2019/12/GeoBlock_Default.jpg" caption="Figure 2: Create TXT record with a 'Geolocation' routing policy for all other countries." %}

That's it! In our simple case only two entries are needed. The resulting two Route 53 Geolocation records ar show in Figure 3.  

{% include figure image_path="/content/uploads/2019/12/GeoBlock_Result.jpg" caption="Figure 3: Resulting TXT record sets for a 'Geolocation' routing policy." %}

Once we have used the above "TXT" records to validate the setup, we can setup a corresponding production record of e.g. our website or API endpoint.

## Error page using CloudFront and S3

As mentioned above you can easily blackhole traffic from undesired locations, by responding with the [Loopback](https://en.wikipedia.org/wiki/Loopback) IPv4 address of 127.0.0.1. As a result traffic from these clients destined for your endpoint would never leave their system.
But as mentioned before, geolocation routing works by mapping IP addresses to locations. And this approach comes with [inherent inaccuracies](/2019/03/01/limitations-of-geo-dns/).

Therefore a better approach would be to direct blocked users to a static website, which outlines the reason of the block and also provides an appeal-process. In its simplest form this process could ask users to contact your technical support for help.

You can easily use CloudFront and S3 to [serve this static error page](https://aws.amazon.com/premiumsupport/knowledge-center/cloudfront-serve-static-website/).   

# Testing the Setup

Let's get back to testing our [Amazon Route 53 Geolocation Routing](https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/routing-policy.html#routing-policy-geo) setup and validate that users in China are indeed served with a separate answer than users outside China. To do so, we will be using RIPE Atlas probes.

## RIPE Atlas

[RIPE Atlas](https://atlas.ripe.net/) is a global network of hardware devices, called probes and anchors, that actively measure Internet connectivity. Anyone can access this data via Internet traffic maps, streaming data visualisations, and an API. RIPE Atlas users can also perform customised measurements to gain valuable data about their own networks.

I highly recommend you to consider [hosting a RIPE Atlas probe](https://atlas.ripe.net/get-involved/become-a-host/) yourself. Not only will you benefit from the data that it collects on your Internet connection, but it will also allow you to run customized measurements against various Internet targets. And in the end every additional RIPE Atlas probe will benefit the overall Internet community.

For our purposes we will create a one-off [RIPE Atlas measurement](https://atlas.ripe.net/measurements/) of type DNS with the above configured hostname as the target (See Figure 4). Make sure to configure usage of the probe's resolver and force DNS resolution on the probe. Also we want to select all available RIPE Atlas probes within China, as well as a set of probes outside China.

{% include figure image_path="/content/uploads/2019/12/RIPE_Atlas_GeoBlock.jpg" caption="Figure 4: RIPE Atlas measurement setup to test Geoblocking in China." %}

A few minutes after running the one-off RIPE Atlas measurement you should be able to see and download your results. In order to analyze the results and figure out whether our configuration is working, we need to write a small script.

## Results

After downloading your RIPE Atlas measurement results in the nd-json (fragmented) format, the below script will allow you to analyze the results.

This script iterates through the results and for each probe determines:
* The location country of the probe as specified by the probe's host.
* The result of the DNS lookup, which is either "China" or "Default".
* Whether probes identified to be
 * in China receive the result "China"
 * outside China receive the result "Default"

Please note that this script uses two custom RIPE Atlas libraries, which you first need to install with ```pip install ripe.atlas.sagan --user``` and ```pip install ripe.atlas.cousteau --user```.


```
#!/usr/bin/env python3

from ripe.atlas.sagan import Result
from ripe.atlas.cousteau import Probe

my_results_file = "./RIPE-Atlas-measurement-fraq.json"
with open(my_results_file) as results:
    for result in results.readlines():
        parsed_result = Result.get(result)
        probe = Probe(id=parsed_result.probe_id)
        probe_country = probe.country_code
        probe_id = parsed_result.probe_id
        try:
            probe_result = parsed_result.responses[0].abuf.answers[0].address
        except:
            probe_result = "None"
        status = "Not OK <===="
        if (probe_country == "CN" and probe_result == "China"):
            status = "OK"
        if (probe_country != "CN" and probe_result == "Default"):
            status = "OK"
        if (probe_result == "None"):
            status = "Unknown"

        print(probe_country + ": " + str(probe_id) + ": " + probe_result + ": " + status)
```

## Findings

Using the above script along with the RIPE Atlas measurement results, you'll notice that a few probes - identified by their hosts to be located in China - are not receiving a DNS resolution of "China" for the geoblock DNS entry. Instead they are receiving the "Default" entry, as Route 53 does not identify them to be in China.
Looking closer at these probes we can see that the probes are indeed located in Hong Kong. Keep in mind that Route 53 treats Hong Kong as a separate country and also RIPE Atlas allows specifying Hong Kong as a probe's country. In this case the probe's host felt that the probe - even though located in Hong Kong - should be labeled as being in China.

# Summary

This blog post walked you through using [Amazon Route 53 Geolocation Routing](https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/routing-policy.html#routing-policy-geo), in order to block access to services from certain countries. Furthermore it showed how [RIPE Atlas](https://atlas.ripe.net/) can be used to validate the geoblocking setup.
