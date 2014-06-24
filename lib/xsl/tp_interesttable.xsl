<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
				version="1.0"
				xmlns:html="http://www.w3.org/1999/xhtml">

	<xsl:output indent="yes"/>

	<xsl:template match="/">
		<html:html>
			<html:body>
				<html:table class="uor_table" cellpadding="3" cellspacing="0">
					<html:thead class="uor_table_title">
						<html:tr>
							<html:td colspan="3">Currently Registered Signal Interests</html:td>
						</html:tr>
						<html:tr>
							<html:td>Signal Name</html:td>
							<html:td>Signal Target</html:td>
							<html:td>Signal Handler</html:td>
						</html:tr>
					</html:thead>
					<html:tbody class="uor_table_data">
						<xsl:apply-templates select="//html:div[@event]">
							<xsl:sort select="@event"/>
						</xsl:apply-templates>
					</html:tbody>
				</html:table>
			</html:body>
		</html:html>
	</xsl:template>

	<xsl:template match="html:div[@event]">
		<html:tr>
			<html:td>
				<xsl:value-of select="@event"/>
			</html:td>
			<html:td>
				<xsl:value-of select="@target"/>
			</html:td>
			<html:td>
				<xsl:apply-templates select="html:span[@handler]"/>
			</html:td>
		</html:tr>
	</xsl:template>

	<xsl:template match="html:span[@handler]">
		<html:a class="uor_table_link"
				href="#"
				onclick="parent.$shell('* $byOID(&quot;{@handler}&quot;)'); return false"
				onmouseover="return true">
			<xsl:value-of select="@handler"/>
		</html:a>
		<html:br/>
	</xsl:template>

</xsl:stylesheet>
