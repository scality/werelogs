# Design of WereLogs

## Rationale

Any logging system must be efficient, and provide enough details (relevance)
whenever an error is raised within the system, so that any user or
administrator can check what's going on. Each of these aspects can have
multiple answers, depending on the language used, the running environment, and
the technology stack used. This project aims at providing one of the possible
answers for a Node.js stack, that could be included in other higher-level tools.

## Performance

Node.js is an interpreter widely known for its good I/O management and
throughput. Alas, it is also widely known for its disability at executing
computing operations. Logs outputted by any kind of service are usually
formatted in a roughly structured way that administrators are familiar with,
including human-readable timestamps, warning levels, and messages. This
formatting operation usually implies some kind of computing in order to apply
the common formatting while generating the logs.

Given a Node.js environment, we might want to avoid any kind of computing as
much as possible, which means that we do not want to format the logs at all. A
number of systems today already started doing this, providing third-party tools
to make the logs human-readable. In the same mindset, this library aims at
logging raw JSON objects, that can be later used to generate beautiful lines of
logs, or that can be filtered or sorted on an arbitrary basis. This means that we
can provide a no-computation logging environment (except obviously the light
cost of serializing/deserializing JSON into and from objects).

In order to manage an arbitrary JSON format, we rely on the
[bunyan](http://github.com/trentm/node-bunyan) library.

## Relevance of the logs

Usually, in order to provide relevant logs for a given service, developers tend
to add more logs or to input a great quantity of data. Also, whenever an error
is hit, the most common thing written out to the log system is a stack trace of
where the error is happening. This is actually something we consider as subpar
as it means that whenever the errors happen, depending on your log level, you
might have already lost quite a bit of priceless information about the error
encountered, and the code path the request went through. To address this, we
offer multiple features:

* [Request ID namespacing](###request-id-namespacing)
* [Request unit Logs](###request-unit-logs)

### Request ID namespacing

Usually, in networked systems, it is considered good practice to generate an
unique ID for each request, that can be used later on to identify all log
entries associated to one given request. WereLogs was partly designed for
distributed systems, designed as micro-services, since this it a good way to
reduce some of the negative impacts of Node.js (Garbage Collector related
performance impacts, etc.).

Thus, instead of wielding one single request ID, WereLogs is able to manage
a list of IDs, interpreted as a namespacing of IDs. For instance, if we assume
that a front-end service generated the ID ```CAFEBABE2549```, any service
called upon would generate their own request IDs namespaces by this first
unique ID that identifies the higher-level request.

Thanks to those IDs, an operator could look into all requests on the full
micro-service based cluster by only using the highest-level of request ID; but
would still be able to differenciate between each sub-request.

### Request unit Logs

The idea of the Request unit Logs is related to the fact that sometimes, an
error happens in the system, but it is then too late to log enough information
about the whole process that led to the error (Bug ? Unexpected usage ? Other
?).

The answer to this problematic is actually quite simple. Whenever a request
starts, an unique ID is generated (possibly namespaced by higher-level requests
unique IDs), and an associated logging context is created. This context is then
used for any subsequent logging operation.

Actually, the context is buffering all logging operations until it is freed by
the service. If any logging operation's log level is higher than the global log
level, they are outputted immediately. Now we're at the critical point: whenever
an error is logged (by using any logging operation at a log level greater or
equal to 'error'), the logging context will dump automatically the whole list
of buffered log entries. This will have for effect to dump the full trace of
logging messages related to a given request that led to an error, avoiding the
loss of the full code path used by the handling of this specific request. If no
error (or higher level logging operation) is logged before the log context is
freed, then the full set of buffered logging messages is freed, not taking
any logging resources for the log entries not considered 'useless' by a given
log level configuration.
