Command Line Interface (cli)

addFact
        <idSource>
        <tag>
        <TTL>
        <reliability>
        <json>

addRule
        <idSource>
        <tag>
        <json>

updateFact
        <idFact>
        <idSource>
        <tag>
        <TTL>
        <reliability>
        <json>

query
        <json>

removeFact
        <idSource>
        <json>

removeRule
        <idSource>
        <idRule>

registerTags
        <json>

tagDetails
        <stringArray...>

Usage example:

*** DEPRECATED ***

```bash
$ ./cli/register
proto1

$ ./cli/store 'proto1' 'RDF' '{"subject":"dog", "relation":"is a", "object":"animal"}'
done

$ ./cli/store 'proto1' 'RDF' '{"subject":"cat", "relation":"is a", "object":"animal"}'
done

$ ./cli/query '{"subject":"$s", "object":"animal"}'
[
{'_data': {'subject': 'dog', 'relation': 'is a', 'object': 'animal'}, '_id': 1, '_infoSum': 'RDF', '_reliability': 100, '_source': 'proto1', '_ttl': 1},
{'_data': {'subject': 'cat', 'relation': 'is a', 'object': 'animal'}, '_id': 2, '_infoSum': 'RDF', '_reliability': 100, '_source': 'proto1', '_ttl': 1}
]

$ ./cli/delete 'proto1' '{"subject":"$s", "object":"animal"}'
done

$ ./cli/query '{"subject":"$s", "object":"animal"}'
[]
```