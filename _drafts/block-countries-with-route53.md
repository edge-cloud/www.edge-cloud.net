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

{% include figure image_path="/content/uploads/2019/12/GeoBlock_China.png" caption="Figure 1: Create TXT record with a 'Geolocation' routing policy for the origin country 'China'." %}

{% include figure image_path="/content/uploads/2019/12/GeoBlock_Default.png" caption="Figure 2: Create TXT record with a 'Geolocation' routing policy for all other countries." %}

{% include figure image_path="/content/uploads/2019/12/GeoBlock_Result.png" caption="Figure 3: Resulting TXT record sets for a 'Geolocation' routing policy." %}

## Error page using CloudFront and S3

# Testing the Setup

## RIPE Atlas

[RIPE Atlas](https://atlas.ripe.net/) is a global network of hardware devices, called probes and anchors, that actively measure Internet connectivity. Anyone can access this data via Internet traffic maps, streaming data visualisations, and an API. RIPE Atlas users can also perform customised measurements to gain valuable data about their own networks.

I highly recommend you to consider [hosting a RIPE Atlas probe](https://atlas.ripe.net/get-involved/become-a-host/) yourself. Not only will you benefit from the data that it collects on your Internet connection, but it will also allow you to run customized measurements against various Internet targets. And in the end every additional RIPE Atlas probe will benefit the overall Internet community.

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

# Summary
