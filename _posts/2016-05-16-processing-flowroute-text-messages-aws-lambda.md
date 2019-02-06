---
id: 2232
title: Processing Flowroute text messages with AWS Lambda
date: 2016-05-16T11:23:00+00:00
author: Christian Elsen
excerpt: Flowroute provides a great API for sending and receiving text messages. This blog post shows you how to use AWS Lambda to process these messages.
layout: single
permalink: /2016/05/16/processing-flowroute-text-messages-aws-lambda/
redirect_from: 
  - /2016/05/16/processing-flowroute-text-messages-aws-lambda/amp/
categories:
  - EdgeCloud
tags:
  - AWS
---
<a href="https://www.flowroute.com/" target="_blank">Flowroute</a> is a great SIP communications provider that I&#8217;ve been using for a few years now. Especially because they support <a href="https://en.wikipedia.org/wiki/T.38" target="_blank">T.38</a> for sending and receiving fax messages.

Earlier this year Flowroute added the capability for inbound and outbound <a href="https://www.flowroute.com/sms/" target="_blank">text messages</a> (aka. SMS) to their service.

In this post I want to show you how to integrate Flowroute&#8217;s inbound text messaging capabilities with <a href="https://aws.amazon.com/lambda/" target="_blank">AWS Lambda</a> &#8211; the serverless compute offering from AWS. Instead of keeping servers up and running, but mostly idle, Lambda offers you the ability to only pay for execution of a software function whenever a text message arrives. Such a solution is able to handle various loads ranging from a handful of text messages per month to millions of messages.

In this example incoming text messages are forwarded via E-Mail to a configurable address (See Figure 1). But you could as well implement other functionality, such as text message based voting or alike with this approach.

<div id="attachment_2262" style="width: 610px" class="wp-caption aligncenter">
  <a href="/content/uploads/2016/05/cloudcraft-Flowroute-SMS2EMail.png"><img src="/content/uploads/2016/05/cloudcraft-Flowroute-SMS2EMail-600x365.png" alt="Figure 1: Architecture for processing Flowroute text messages" width="600" height="365" class="size-large wp-image-2262" srcset="/content/uploads/2016/05/cloudcraft-Flowroute-SMS2EMail-600x365.png 600w, /content/uploads/2016/05/cloudcraft-Flowroute-SMS2EMail-350x213.png 350w, /content/uploads/2016/05/cloudcraft-Flowroute-SMS2EMail-768x467.png 768w, /content/uploads/2016/05/cloudcraft-Flowroute-SMS2EMail.png 1400w" sizes="(max-width: 600px) 100vw, 600px" /></a>

  <p class="wp-caption-text">
    Figure 1: Architecture for processing Flowroute text messages
  </p>
</div>

### Flowroute text message API documentation

You can find more details on the Flowroute API documentation for receiving inbound text messages at <a href="https://developer.flowroute.com/docs/inbound-messages" target="_blank">https://developer.flowroute.com/docs/inbound-messages</a>. Note that you need:

  * A Flowroute phone number added to the Direct Inward Dialing page, which will receive the text message.
  * A web application with a public IP or URL. This article shows you how to use AWS Lambda for creating and hosting this web application.

### AWS Pre-Requisites

This example uses <a href="https://aws.amazon.com/ses/" target="_blank">Amazon Simple Email Service (Amazon SES)</a> to deliver the received text message. You must at least have <a href="http://docs.aws.amazon.com/ses/latest/DeveloperGuide/verify-addresses-and-domains.html" target="_blank">configured SES with a verified E-Mail address or domain</a> in order to use it for sending E-Mails via the script below.

### AWS Identity and Access Management role

<a href="https://aws.amazon.com/iam/" target="_blank">AWS Identity and Access Management</a> roles allow you to delegate access to services. The AWS services can assume a role to obtain temporary security credentials that can be used to make AWS API calls. Consequently, you don&#8217;t have to share long-term credentials or define permissions for each entity that requires access to a resource.

This approach allows us to grant AWS Lambda permission to access Amazon SES, without the need to embed credentials within the code executed by Lambda. We can therefore even store the code in <a href="https://github.com/chriselsen/AWSLambda_FlowrouteSMS" target="_blank">Github</a> without the risk of exposing access keys.

To create an AWS IAM profile navigate to the &#8220;Identity & Access Management&#8221; service within the &#8220;Security & Identity&#8221; section in the AWS Console (See Figure 2).

<div id="attachment_2244" style="width: 530px" class="wp-caption aligncenter">
  <a href="/content/uploads/2016/05/IAM01.png"><img src="/content/uploads/2016/05/IAM01.png" alt="Figure 2: Navigate to Identity & Access Management" width="520" height="435" class="size-full wp-image-2244" srcset="/content/uploads/2016/05/IAM01.png 520w, /content/uploads/2016/05/IAM01-350x293.png 350w" sizes="(max-width: 520px) 100vw, 520px" /></a>

  <p class="wp-caption-text">
    Figure 2: Navigate to Identity & Access Management
  </p>
</div>

Create a new role and give it a meaningful name, such as &#8220;Lambda_SES&#8221; (See Figure 3). We will later select the role under this name.

<div id="attachment_2245" style="width: 610px" class="wp-caption aligncenter">
  <a href="/content/uploads/2016/05/IAM02.png"><img src="/content/uploads/2016/05/IAM02-600x307.png" alt="Figure 3: Create a new role - Step 1" width="600" height="307" class="size-large wp-image-2245" srcset="/content/uploads/2016/05/IAM02-600x307.png 600w, /content/uploads/2016/05/IAM02-350x179.png 350w, /content/uploads/2016/05/IAM02-768x393.png 768w, /content/uploads/2016/05/IAM02.png 1400w" sizes="(max-width: 600px) 100vw, 600px" /></a>

  <p class="wp-caption-text">
    Figure 3: Create a new role &#8211; Step 1
  </p>
</div>

As the role type select &#8220;AWS Lambda&#8221; (See Figure 4). This type allows AWS Lambda functions to access other AWS services.

<div id="attachment_2246" style="width: 610px" class="wp-caption aligncenter">
  <a href="/content/uploads/2016/05/IAM03.png"><img src="/content/uploads/2016/05/IAM03-600x307.png" alt="Figure 4: Create a new role - Step 2" width="600" height="307" class="size-large wp-image-2246" srcset="/content/uploads/2016/05/IAM03-600x307.png 600w, /content/uploads/2016/05/IAM03-350x179.png 350w, /content/uploads/2016/05/IAM03-768x393.png 768w, /content/uploads/2016/05/IAM03.png 1400w" sizes="(max-width: 600px) 100vw, 600px" /></a>

  <p class="wp-caption-text">
    Figure 4: Create a new role &#8211; Step 2
  </p>
</div>

Enter &#8220;SES&#8221; into the Filter to only show policies that affect the Amazon Simple Email Service. Select the policy &#8220;AmazonSESFullAccess&#8221; and click on &#8220;Next Step&#8221; to proceed (See Figure 5).

<div id="attachment_2247" style="width: 610px" class="wp-caption aligncenter">
  <a href="/content/uploads/2016/05/IAM04.png"><img src="/content/uploads/2016/05/IAM04-600x307.png" alt="Figure 5: Create a new role - Step 3" width="600" height="307" class="size-large wp-image-2247" srcset="/content/uploads/2016/05/IAM04-600x307.png 600w, /content/uploads/2016/05/IAM04-350x179.png 350w, /content/uploads/2016/05/IAM04-768x393.png 768w, /content/uploads/2016/05/IAM04.png 1400w" sizes="(max-width: 600px) 100vw, 600px" /></a>

  <p class="wp-caption-text">
    Figure 5: Create a new role &#8211; Step 3
  </p>
</div>

Review the settings for the role to be created and confirm them by clicking on &#8220;Create Role&#8221; (Figure 6).

<div id="attachment_2248" style="width: 610px" class="wp-caption aligncenter">
  <a href="/content/uploads/2016/05/IAM05.png"><img src="/content/uploads/2016/05/IAM05-600x305.png" alt="Figure 6: Create a new role - Step 4" width="600" height="305" class="size-large wp-image-2248" srcset="/content/uploads/2016/05/IAM05-600x305.png 600w, /content/uploads/2016/05/IAM05-350x178.png 350w, /content/uploads/2016/05/IAM05-768x391.png 768w, /content/uploads/2016/05/IAM05.png 1400w" sizes="(max-width: 600px) 100vw, 600px" /></a>

  <p class="wp-caption-text">
    Figure 6: Create a new role &#8211; Step 4
  </p>
</div>

This completes creating the AWS IAM role for AWS Lambda. If you decide to use a different AWS service instead of SES, e.g. DynamoDB for storing the text messages, you will need to adapt your IAM role&#8217;s policy.

### Create an Amazon API Gateway endpoint

We need to expose the AWS Lambda function via a REST API endpoint, so that Flowroute can invoke the function. Flowroute will send a POST message to the endpoint. Therefore we will solely allow POST messages to our AWS Lambda function.

Within the AWS Console, head over to the Amazon API Gateway section and create a new API. Give it a meaningful name and description (See Figure 7).

<div id="attachment_2274" style="width: 610px" class="wp-caption aligncenter">
  <a href="/content/uploads/2016/05/FlowrouteUpdate1.png"><img src="/content/uploads/2016/05/FlowrouteUpdate1-600x364.png" alt="Figure 7: Create a new API Gateway" width="600" height="364" class="size-large wp-image-2274" srcset="/content/uploads/2016/05/FlowrouteUpdate1-600x364.png 600w, /content/uploads/2016/05/FlowrouteUpdate1-350x212.png 350w, /content/uploads/2016/05/FlowrouteUpdate1-768x465.png 768w, /content/uploads/2016/05/FlowrouteUpdate1.png 830w" sizes="(max-width: 600px) 100vw, 600px" /></a>

  <p class="wp-caption-text">
    Figure 7: Create a new API Gateway
  </p>
</div>

### Node.js function in AWS Lambda

Next we will create a Node.js function in AWS Lambda that will perform the actual job of re-formatting the incoming text message and sending it out as E-Mail.

For this navigate to the &#8220;Lambda&#8221; service within the &#8220;Compute&#8221; section in your console. Create a new function and skip the blueprint selection.

Under &#8220;Configure Triggers&#8221; select the API Gateway &#8220;API name&#8221; that you created in the previous section. Select &#8220;prod&#8221; for the Deployment Stage and &#8220;Open&#8221; for Security (See Figure 8). Flowroute will later send a POST message to this endpoint and trigger the Lambda function.

<div id="attachment_2661" style="width: 610px" class="wp-caption aligncenter">
  <a href="/content/uploads/2016/05/FlowRouteUpdate5.jpg"><img src="/content/uploads/2016/05/FlowRouteUpdate5-600x368.jpg" alt="Figure 8: AWS Lambda - Configure triggers" width="600" height="368" class="size-large wp-image-2661" srcset="/content/uploads/2016/05/FlowRouteUpdate5-600x368.jpg 600w, /content/uploads/2016/05/FlowRouteUpdate5-350x215.jpg 350w, /content/uploads/2016/05/FlowRouteUpdate5-768x471.jpg 768w, /content/uploads/2016/05/FlowRouteUpdate5.jpg 1229w" sizes="(max-width: 600px) 100vw, 600px" /></a>

  <p class="wp-caption-text">
    Figure 8: AWS Lambda &#8211; Configure triggers
  </p>
</div>

Next, configure the new function, by providing a meaning-full name, e.g. &#8220;inboundTextMessage&#8221;, entering a description and choosing &#8220;Node.js 4.3&#8221; as the Runtime (See Figure 9)

<div id="attachment_2278" style="width: 610px" class="wp-caption aligncenter">
  <a href="/content/uploads/2016/05/FlowrouteUpdate6.png"><img src="/content/uploads/2016/05/FlowrouteUpdate6-600x323.png" alt="Figure 9: Create a Lambda function" width="600" height="323" class="size-large wp-image-2278" srcset="/content/uploads/2016/05/FlowrouteUpdate6-600x323.png 600w, /content/uploads/2016/05/FlowrouteUpdate6-350x189.png 350w, /content/uploads/2016/05/FlowrouteUpdate6-768x414.png 768w, /content/uploads/2016/05/FlowrouteUpdate6.png 1249w" sizes="(max-width: 600px) 100vw, 600px" /></a>

  <p class="wp-caption-text">
    Figure 9: Create a Lambda function
  </p>
</div>

Enter the code below into the inline code window. You can also find the code on <a href="https://github.com/chriselsen/AWSLambda_FlowrouteSMS/blob/master/SMS2EMail.nodejs" target="_blank">Github</a>.

The first section sets up the AWS SDK for interfacing with Amazon SES. The next section extracts text message values out of the posted data from Flowroute. The next section formats the outgoing E-Mail message. The last section sends the E-Mail message via Amazon SES.

<pre>exports.handler = function(event, context, callback) {
    var AWS = require('aws-sdk');
    AWS.config.region = 'us-west-2';
    var SES = new AWS.SES();

    var obj = JSON.parse(event.body);
    var to = (obj.to === undefined ? 'Undefined (to)' : obj.to);
    var body = (obj.body === undefined ? 'Undefined (body)' : obj.body);
    var from = (obj.from === undefined ? 'Undefined (from)' : obj.from);
    var id = (obj.id === undefined ? 'Undefined (id)' : obj.id);

    var emailParams = {
        Destination: {
            ToAddresses: ["recipient@edge-cloud.net"]
        },
        Message: {
            Body: {
                Html: {
                    Data: "From: " + from + "&lt;br&gt;To: " + to + "&lt;br&gt;Message: " + body + "&lt;p&gt;ID: " + id
                },
                Text: {
                    Data: "From: " + from + "\nTo: " + to + "\nMessage: " + body + "\n\n" + id
                }
            },
            Subject: {
                Data: "Text message to " + to
            }
        },
        Source: from + "&lt;sms@edge-cloud.net&gt;"
    };

    var email = SES.sendEmail(emailParams, function(err, data){
        if(err) {
            var responseBody = {
                message: "Message failed"
            };

            var response = {
                statusCode: '500',
                body: JSON.stringify(responseBody)
            };
            console.log("response: " + JSON.stringify(response))
            context.succeed(response);
        } else {
            var responseBody = {
                message: "Message suceeded"
            };

            var response = {
                statusCode: '200',
                body: JSON.stringify(responseBody)
            };
            console.log("response: " + JSON.stringify(response))
            context.succeed(response);    
        }
    });
};
</pre>

Change the E-Mail addresses to whatever E-Mail addresses you would like to use. You might also want to adapt the AWS region in line 3, in case you use Amazon Simple Email Service in a different region than US-West-2.

Finish the configuration step by selecting the previously created &#8220;Lambda_SES&#8221; role and increasing the timeout to 15 seconds (See Figure 10).

<div id="attachment_2250" style="width: 610px" class="wp-caption aligncenter">
  <a href="/content/uploads/2016/05/Lambda02.png"><img src="/content/uploads/2016/05/Lambda02-600x518.png" alt="Figure 10: Create a Lambda function - Advanced Settings" width="600" height="518" class="size-large wp-image-2250" srcset="/content/uploads/2016/05/Lambda02-600x518.png 600w, /content/uploads/2016/05/Lambda02-350x302.png 350w, /content/uploads/2016/05/Lambda02-768x663.png 768w, /content/uploads/2016/05/Lambda02.png 1385w" sizes="(max-width: 600px) 100vw, 600px" /></a>

  <p class="wp-caption-text">
    Figure 10: Create a Lambda function &#8211; Advanced Settings
  </p>
</div>

Review the settings for the function to be created and confirm them by clicking on “Create function” (Figure 11).

<div id="attachment_2279" style="width: 610px" class="wp-caption aligncenter">
  <a href="/content/uploads/2016/05/FlowrouteUpdate7.png"><img src="/content/uploads/2016/05/FlowrouteUpdate7-600x400.png" alt="Figure 11: Create a Lambda function - Confirm" width="600" height="400" class="size-large wp-image-2279" srcset="/content/uploads/2016/05/FlowrouteUpdate7-600x400.png 600w, /content/uploads/2016/05/FlowrouteUpdate7-350x233.png 350w, /content/uploads/2016/05/FlowrouteUpdate7-768x512.png 768w, /content/uploads/2016/05/FlowrouteUpdate7.png 1280w" sizes="(max-width: 600px) 100vw, 600px" /></a>

  <p class="wp-caption-text">
    Figure 11: Create a Lambda function &#8211; Confirm
  </p>
</div>

This completes setting up the AWS Lambda function for processing text messages from Flowroute.

### Testing the AWS Lambda function

Next we want to test the functionality of the newly created AWS Lambda function, before proceeding any further.

Click on the &#8220;Test&#8221; button in the upper left corner (See Figure 12).

<div id="attachment_2252" style="width: 610px" class="wp-caption aligncenter">
  <a href="/content/uploads/2016/05/Lambda04.png"><img src="/content/uploads/2016/05/Lambda04-600x337.png" alt="Figure 12: Complete Lambda function" width="600" height="337" class="size-large wp-image-2252" srcset="/content/uploads/2016/05/Lambda04-600x337.png 600w, /content/uploads/2016/05/Lambda04-350x197.png 350w, /content/uploads/2016/05/Lambda04-768x431.png 768w, /content/uploads/2016/05/Lambda04.png 1400w" sizes="(max-width: 600px) 100vw, 600px" /></a>

  <p class="wp-caption-text">
    Figure 12: Complete Lambda function
  </p>
</div>

Remove the current data in the &#8220;Input test event&#8221; window and replace it with this test event data.

<pre>{
  "body": "{\"to\": \"12066418000\", \"body\": \"Hello there from Flowroute!\", \"from\": \"18553569768\", \"id\": \"mdr1-febb118b9b034338adfc662a8c02fd88\" }",
  "resource": "/{proxy+}",
  "httpMethod": "POST"
}
</pre>

This test event data is derived from the <a href="https://developer.flowroute.com/docs/inbound-messages" target="_blank">Flowroute Messaging API documentation</a> and is an example for what Lambda will receive from AWS API Gateway.

Execute the test by selecting &#8220;Save and test&#8221; (See Figure 13).

<div id="attachment_2663" style="width: 610px" class="wp-caption aligncenter">
  <a href="/content/uploads/2016/05/Lambda05.jpg"><img src="/content/uploads/2016/05/Lambda05-600x573.jpg" alt="Figure 13: Input test event" width="600" height="573" class="size-large wp-image-2663" srcset="/content/uploads/2016/05/Lambda05-600x573.jpg 600w, /content/uploads/2016/05/Lambda05-350x334.jpg 350w, /content/uploads/2016/05/Lambda05-768x733.jpg 768w, /content/uploads/2016/05/Lambda05.jpg 817w" sizes="(max-width: 600px) 100vw, 600px" /></a>

  <p class="wp-caption-text">
    Figure 13: Input test event
  </p>
</div>

If everything was setup correctly, you should see a successful test execution with the status &#8220;Message delivered&#8221; (See Figure 14). Also you should receive an E-Mail message.

<div id="attachment_2254" style="width: 610px" class="wp-caption aligncenter">
  <a href="/content/uploads/2016/05/Lambda06.png"><img src="/content/uploads/2016/05/Lambda06-600x141.png" alt="Figure 14: Successful test execution" width="600" height="141" class="size-large wp-image-2254" srcset="/content/uploads/2016/05/Lambda06-600x141.png 600w, /content/uploads/2016/05/Lambda06-350x82.png 350w, /content/uploads/2016/05/Lambda06-768x180.png 768w, /content/uploads/2016/05/Lambda06.png 1400w" sizes="(max-width: 600px) 100vw, 600px" /></a>

  <p class="wp-caption-text">
    Figure 14: Successful test execution
  </p>
</div>

If this test failed, you need to fix the issue before proceeding. Most likely the issue was caused by a mis-configuration of Amazon Simple Email Service.

### Looking up the API endpoint for the AWS Lambda function

Note down the API endpoint URL from the Lambda function&#8217;s trigger tab for further usage (See Figure 15). As Flowroute doesn&#8217;t support any of the authentication mechanism provided by Amazon API gateway yet, you need to treat the entire URL as a secret. Everyone with knowledge of the URL could invoke your Lambda function and pretend to send you a text message.

<div id="attachment_2280" style="width: 610px" class="wp-caption aligncenter">
  <a href="/content/uploads/2016/05/FlowrouteUpdate8.png"><img src="/content/uploads/2016/05/FlowrouteUpdate8-600x302.png" alt="Figure 15: Retrieve API endpoint URL" width="600" height="302" class="size-large wp-image-2280" srcset="/content/uploads/2016/05/FlowrouteUpdate8-600x302.png 600w, /content/uploads/2016/05/FlowrouteUpdate8-350x176.png 350w, /content/uploads/2016/05/FlowrouteUpdate8-768x387.png 768w, /content/uploads/2016/05/FlowrouteUpdate8.png 892w" sizes="(max-width: 600px) 100vw, 600px" /></a>

  <p class="wp-caption-text">
    Figure 15: Retrieve API endpoint URL
  </p>
</div>

The AWS Lambda API endpoint URL will be used with Flowroute in a subsequent step.

### Configuring Flowroute

As a last step you need to configure Flowroute to use the new web service that we just created. For this head over to the <a href="https://manage.flowroute.com/accounts/preferences/api/" target="_blank">Flowroute web console</a> and open the tab &#8220;Preferences -> API Control&#8221;.

Enter the URL of your Lambda API endpoint into the &#8220;SMS Callback&#8221; field and save the configuration via a click on &#8220;+ Enable SMS&#8221; (See Figure 16).

<div id="attachment_2258" style="width: 610px" class="wp-caption aligncenter">
  <a href="/content/uploads/2016/05/FlowRoute01.png"><img src="/content/uploads/2016/05/FlowRoute01-600x292.png" alt="Figure 16: Configure Flowroute  SMS Callback" width="600" height="292" class="size-large wp-image-2258" srcset="/content/uploads/2016/05/FlowRoute01-600x292.png 600w, /content/uploads/2016/05/FlowRoute01-350x170.png 350w, /content/uploads/2016/05/FlowRoute01-768x374.png 768w, /content/uploads/2016/05/FlowRoute01.png 1400w" sizes="(max-width: 600px) 100vw, 600px" /></a>

  <p class="wp-caption-text">
    Figure 16: Configure Flowroute SMS Callback
  </p>
</div>

Congratulations! You completed your setup. Now send yourself a text message to your Flowroute DID and see you AWS Lambda turns it into an E-Mail message.

### Summary

Flowroute provides a great API for sending and receiving text messages. This blog post showed you how to use AWS Lambda to process these messages and forward them as E-Mail using AWS SES.
