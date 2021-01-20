{{/*
Expand the name of the chart.
*/}}
{{- define "pm.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Create a default fully qualified app name.
We truncate at 63 chars because some Kubernetes name fields are limited to this (by the DNS naming spec).
If release name contains chart name it will be used as a full name.
*/}}
{{- define "pm.fullname" -}}
{{- if .Values.fullnameOverride }}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- $name := default .Chart.Name .Values.nameOverride }}
{{- if contains $name .Release.Name }}
{{- .Release.Name | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" }}
{{- end }}
{{- end }}
{{- end }}

{{/*
Create chart name and version as used by the chart label.
*/}}
{{- define "pm.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Common labels
*/}}
{{- define "pm.labels" -}}
helm.sh/chart: {{ include "pm.chart" . }}
{{ include "pm.selectorLabels" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}

{{/*
Selector labels
*/}}
{{- define "pm.selectorLabels" -}}
app.kubernetes.io/name: {{ include "pm.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}

{{- define "pm.gw.fullname" -}}
oauth-gw
{{- end -}}

{{- define "pm.gw.labels" -}}
{{ include "pm.labels" . }}
component: {{ include "pm.gw.fullname" . }}
{{- end -}}

{{- define "pm.gw.selectorLabels" -}}
{{ include "pm.selectorLabels" . }}
component: {{ include "pm.gw.fullname" . }}
{{- end -}}

{{- define "pm.rs.fullname" -}}
resource-server
{{- end -}}

{{- define "pm.rs.labels" -}}
{{ include "pm.labels" . }}
component: {{ include "pm.rs.fullname" . }}
{{- end -}}

{{- define "pm.rs.selectorLabels" -}}
{{ include "pm.selectorLabels" . }}
component: {{ include "pm.rs.fullname" . }}
{{- end -}}

{{- define "pm.app.fullname" -}}
web-app
{{- end -}}

{{- define "pm.app.labels" -}}
{{ include "pm.labels" . }}
component: {{ include "pm.app.fullname" . }}
{{- end -}}

{{- define "pm.app.selectorLabels" -}}
{{ include "pm.selectorLabels" . }}
component: {{ include "pm.app.fullname" . }}
{{- end -}}