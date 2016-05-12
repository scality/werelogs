# Werelogs 2.0

## Current Issues

Logging currently is taxing a lot on the node.js process it's being called from.
Upon closer look `bunyan` and `bunyan-logstash` modules are doing parsing,
stringifying, decorating and object-copying on top of what Werelogs is already
doing.

## Proposal
1. Remove bunyan and bunyan-logstash modules from Werelogs
2. Werelogs would be logging directly to STDOUT.

    Logs will be in the same JSON format as we have had when using bunyan,
    bunyan-logstash. Any stacktrace printed by the process would be sent to
    STDERR.
3. Use Filebeat - a lightweight log shipper that can ship logs directly to
Logstash or Elasticsearch

    Filebeat is an agent that can attach to an individual process. So the idea
    is to attach a Filebeat agent to each S3, bucketd, repd, vaultd etc.
    processes and read directly from STDOUT. Since it can rotate the logs on its
    own, we can write JSON logs with rotation on the disk (if needed).
    We can also generate SYSLOG format(if needed).


## Work in progress

1. Werelogs#wip/2.0 branch has bunyan modules removed, logging to STDOUT and
removes some object copying overhead.

## To be done

1. Install Filebeat to work with MetaData and send the logs directly to Elasticsearch
2. Explore if we have to go through Logstash from Filebeat for additonal decoration or
normalization
3. Work on Federation to generate required config and spawning of Filebeat agents with
the deployed processes.
