<?xml version="1.0" encoding="UTF-8"?>

<xsl:stylesheet
	xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
	version="1.0">

	<xsl:output method="xml" indent="yes" />

	<xsl:param name="elementRef" />
	<xsl:param name="fullWindowName" />

	<xsl:template match="/">
	<table xmlns="http://www.w3.org/1999/xhtml" cellpadding="3" cellspacing="0" class="uor_table">
		<thead class="uor_table_title">
			<tr><td colspan="2">Attribute Inspector</td></tr>
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
				<input xmlns="http://www.w3.org/1999/xhtml" type="text" onchange="{$fullWindowName}.$shell('{$elementRef}.setAttribute(&quot;{name}&quot;,&quot;' + this.value + '&quot;)',true,true,null,&quot;TSH&quot;);" value="{value}" />
			</td>
		</tr>
	</xsl:template>

</xsl:stylesheet>
