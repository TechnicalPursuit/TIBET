{
  "AWSEBDockerrunVersion": "1",
  "Image": {
    "Name": "{{accountid}}.dkr.ecr.{{region}}.amazonaws.com/{{name}}:v.{{version}}",
    "Update": "true"
  },
  "Ports": [
    {
      "ContainerPort": "1407"
    }
  ]
}
