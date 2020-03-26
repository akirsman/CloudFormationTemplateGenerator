'use strict';
var fs = require('fs')
main(process.argv.slice(2));

function main(args) {
    if (args.length < 2) {
        console.log("Expected parameters: <service> <output file>");
        return
    }
    let service = args[0]
    let outfile = args[1]
    let chunks = [];
    process.stdin.on('readable', () => {
        var chunk;
        while ((chunk = process.stdin.read()) !== null) {
            chunks.push(chunk);
        }
    });
    process.stdin.on('end', () => {
        let data = Buffer.concat(chunks);
        let json = JSON.parse(data);
        generateTemplate(outfile, service, json)
    });
}

// generate template
function generateTemplate(outfile, service, json) {
    switch (service) {
        case 'ec2':
            generateEC2Template(outfile, json)
            break;
        default:
            console.log('unknown service: ' + service);
    }
}

// write template file
function generateEC2Template(outfile, desc) {
    // generate template
    var t = {};
    t.AWSTemplateFormatVersion = "2010-09-09";
    t.Resources = {};

    // generate ec2 template
    desc.Reservations.forEach(r => {
        r.Instances.forEach(i => {
            var i2 = {};
            i2.Type = "AWS::EC2::Instance"
            i2.Properties = {}
            i2.Properties.KeyName = i.KeyName
            i2.Properties.ImageId = i.ImageId
            i2.Properties.InstanceType = i.InstanceType
            i2.Properties.SecurityGroupIds = {}
            i.SecurityGroups.forEach(sg => {
                i2.Properties.SecurityGroupIds = []
                i2.Properties.SecurityGroupIds.push(sg.GroupId)
            })
            i2.Properties.SubnetId = i.SubnetId
            i2.Properties.Tags = []
            i.Tags.forEach(t => {
                var t2 = {}
                t2.Key = t.Key
                t2.Value = t.Value
                i2.Properties.Tags.push(t2)
            })
            var name = "X" + Math.floor(Math.random() * 100000).toString()
            t.Resources[name] = i2
        });
    });

    // write template
    fs.writeFileSync(outfile, JSON.stringify(t), () => { });
}
