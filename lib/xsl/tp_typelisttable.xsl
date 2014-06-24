<?xml version="1.0" encoding="UTF-8"?>

<xsl:stylesheet
	xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
	version="1.0">

	<xsl:output method="xml" indent="yes" />

	<xsl:variable name="numCols" select="3"/>

	<xsl:template match="/">

	<table xmlns="http://www.w3.org/1999/xhtml" class="uor_table" cellpadding="3" cellspacing="0">
		<thead class="uor_table_title">
			<tr><td colspan="3">TIBET System Report - Alphabetical</td></tr>
		</thead>
		<tbody class="uor_table_data">
			<xsl:for-each select ="/tibet_metadata/tibet_type[position() mod 3 = 1]">
				<tr>
					<xsl:apply-templates select="./@name | following-sibling::tibet_type[position() &lt; 3]/@name"></xsl:apply-templates>
				</tr>
			</xsl:for-each>
		</tbody>
	</table>

	</xsl:template>

	<xsl:template match="@name">
		<td xmlns="http://www.w3.org/1999/xhtml">
			<a class="uor_table_link" href="javascript: parent.$shell(':reflect &quot;{.}&quot;.asType()',true,false,null,&quot;TSH&quot;);">
				<xsl:value-of select="."/>
			</a>
		</td>
	</xsl:template>

</xsl:stylesheet>
