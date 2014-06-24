<?xml version="1.0" encoding="UTF-8"?>

<xsl:stylesheet
	xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
	version="1.0">

	<xsl:output method="xml" indent="yes" />

	<xsl:param name="objectRef" />
	<xsl:param name="fullWindowName" />

	<xsl:template match="/">
	<table xmlns="http://www.w3.org/1999/xhtml" cellpadding="3" cellspacing="0" class="uor_table">
		<thead class="uor_table_title">
			<tr><td colspan="2">Hash Inspector: <xsl:value-of select="$objectRef"/></td></tr>
		</thead>
		<tbody class="uor_table_data">
			<xsl:apply-templates />
		</tbody>
	</table>
	</xsl:template>

	<xsl:template match="/struct/member">
		<tr xmlns="http://www.w3.org/1999/xhtml">
			<td>
				<xsl:value-of select="name"/>
			</td>
			<td>
				<xsl:choose>
					<xsl:when test="starts-with(value,'$') or starts-with(value,'[object')">
						<a class="uor_table_link" href="javascript: parent.$shell(':inspect {$objectRef}.get(&quot;{name}&quot;)',true,true,null,&quot;TSH&quot;);">
							<xsl:value-of select="value"/>
						</a>
					</xsl:when>
					<xsl:otherwise>
						<input xmlns="http://www.w3.org/1999/xhtml" type="text" onchange="{$fullWindowName}.$shell('{$objectRef}.set(&quot;{name}&quot;,&quot;' + this.value + '&quot;)',true,true,null,&quot;TSH&quot;);" value="{value}" />
					</xsl:otherwise>
				</xsl:choose>
			</td>
		</tr>
	</xsl:template>

</xsl:stylesheet>
