'use strict';
main(process.argv.slice(2));

// read describe file
function main(args) {
    var fs = require('fs')
    fs.readFile('describe.json', 'utf16le', (err, data) => {
        if (err) throw err;
        data = data.replace(/^\uFEFF/, '')
        var desc = JSON.parse(data);
        generateEC2Template(desc);
    });
}

// write template file
function generateEC2Template(desc) {
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
    var fs = require('fs');
    fs.writeFileSync('template.json', JSON.stringify(t), () => { });
}
