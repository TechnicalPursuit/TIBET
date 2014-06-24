<?xml version="1.0" encoding="UTF-8"?>

<xsl:stylesheet
	xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
	version="1.0">

	<xsl:output method="xml" indent="yes" />

	<xsl:param name="objectRef" />
	<xsl:param name="fullWindowName" />

	<xsl:template match="/">
		<html xmlns="http://www.w3.org/1999/xhtml">
			<head>
				<title></title>
				<style type="text/css">
					table.inspectortable
					{
						border: solid 1px #CCCCCC;
						border-collapse: collapse;
					}
					td.namecell
					{
						border: solid 1px #CCCCCC;
					}
					td.valuecell
					{
						border: solid 1px #CCCCCC;
					}
					.buttonText
					{
						cursor: pointer;
					}
					.buttonText:hover
					{
						color: red;
					}
					.valueText
					{
						margin: 0px;
						border: solid 1px #CCCCCC;
					}
					.valueText[collapsed="true"]
					{
						height: 4px;
					}
					.valueText[collapsed="false"]
					{
						height: auto;
					}
					.valueText:hover[collapsed="false"]
					{
						border: solid 1px red;
					}
					.valueText:hover[collapsed="true"]
					{
						border: solid 1px red;
						cursor: pointer;
					}
				</style>
				<script type="text/javascript">
				<xsl:comment>
					<![CDATA[
					function adjustOuterFrame()
					{
						if (window.frameElement)
						{
							window.frameElement.style.height =
								document.body.offsetHeight + 8;
						};
					};

					function switchNode(nodeRef)
					{
						if (nodeRef.getAttribute('collapsed') == 'true')
						{
							nodeRef.setAttribute('collapsed','false');
							nodeRef.focus();
						}
						else
						{
							nodeRef.setAttribute('collapsed','true');
							nodeRef.blur();
						};

						adjustOuterFrame();
					};

					function collapseAll(nodeRef)
					{
						var		textareas;
						var		i;

						textareas = document.getElementsByTagName('textarea');

						for (i = 0; i < textareas.length; i++)
						{
							textareas[i].setAttribute('collapsed','true');
						};

						adjustOuterFrame();
					};

					function expandAll(nodeRef)
					{
						var		textareas;
						var		i;

						textareas = document.getElementsByTagName('textarea');

						for (i = 0; i < textareas.length; i++)
						{
							textareas[i].setAttribute('collapsed','false');
						};

						adjustOuterFrame();
					};

					]]>
				</xsl:comment>        
				</script>
			</head>
			<body>
				<table xmlns="http://www.w3.org/1999/xhtml" cellpadding="3" cellspacing="0" class="uor_table inspectortable">
					<thead class="uor_table_title">
						<tr><td>Document Inspector: <xsl:value-of select="$objectRef"/></td><td><span class="buttonText" onclick="expandAll()">Expand All</span>&#160;&#160;&#160;<span class="buttonText" onclick="collapseAll()">Collapse All</span></td></tr>
					</thead>
					<tbody class="uor_table_data">
						<xsl:apply-templates />
					</tbody>
				</table>
			</body>
		</html>
	</xsl:template>

	<xsl:template match="/struct/member">
		<xsl:variable name="theValue">
			<xsl:value-of select="value"/>
		</xsl:variable>

		<!-- Compute the initial number of rows as the number of newlines in
				theValue minus 1 -->
		<xsl:variable name="initialNumRows">
			<xsl:value-of select="string-length($theValue) - string-length(translate($theValue,'&#xa;','')) - 1"/>
		</xsl:variable>

		<!-- If the initial number of rows is less than 1, we need to just
				make it 1 -->
		<xsl:variable name="numRows">
			<xsl:choose>
				<xsl:when test="$initialNumRows &lt; 1">
					<xsl:value-of select="1"/>
				</xsl:when>
				<xsl:otherwise>
					<xsl:value-of select="$initialNumRows"/>
				</xsl:otherwise>
			</xsl:choose>
		</xsl:variable>

		<tr xmlns="http://www.w3.org/1999/xhtml">
			<td class="namecell">
				<xsl:value-of select="name"/>
			</td>
			<td class="valuecell">
				<xsl:choose>
					<xsl:when test="starts-with(value,'$') or starts-with(value,'[object')">
						<a class="uor_table_link" href="javascript: parent.$shell(':inspect {$objectRef}[&quot;{name}&quot;]',true,true,null,&quot;TSH&quot;);">
							<xsl:value-of select="value"/>
						</a>
					</xsl:when>
					<xsl:otherwise>
						<textarea rows="{$numRows}" style="width: 100%; height: {concat($numRows,'.5em')}" onchange="{$fullWindowName}.$shell('{$objectRef}[&quot;{name}&quot;] = &quot;' + this.value + '&quot;',true,true,null,&quot;TSH&quot;);" onclick="switchNode(this); return false;" class="valueText" collapsed="true">
							<xsl:value-of select="value"/>
						</textarea>
					</xsl:otherwise>
				</xsl:choose>
			</td>
		</tr>
	</xsl:template>

</xsl:stylesheet>
