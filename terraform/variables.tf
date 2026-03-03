variable "region" {
  description = "AWS region"
  type        = string
  default     = "ap-south-1"
}

variable "cluster_name" {
  description = "EKS cluster name"
  type        = string
  default     = "hello-hotel"
}

variable "node_type" {
  description = "EC2 instance type for nodes"
  type        = string
  default     = "m7i-flex.large"
}

variable "node_count" {
  description = "Number of nodes"
  type        = number
  default     = 2
}
