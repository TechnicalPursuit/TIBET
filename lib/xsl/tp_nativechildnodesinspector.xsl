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
				<tr><td colspan="2">Child Nodes Inspector</td></tr>
			</thead>
			<tbody class="uor_table_data">
				<xsl:apply-templates />
			</tbody>
		</table>
	</xsl:template>

	<xsl:template match="/array/data/value">
		<tr xmlns="http://www.w3.org/1999/xhtml">
			<td valign="top">
				<a class="uor_table_link" href="javascript: parent.$shell(':inspect {$elementRef}[{position() - 1}]',true,true,null,&quot;TSH&quot;);">
					<xsl:value-of select="."/>
				</a>
			</td>
		</tr>
	</xsl:template>

</xsl:stylesheet>
