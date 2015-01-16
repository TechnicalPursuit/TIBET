<?xml version="1.0" encoding="UTF-8"?>

<!-- Creates a collapsible node tree in the manner of Internet Explorer -->
<!-- Original Author: Dave Lindquist (http://www.gazingus.org) -->
<!-- Modified by wje (William J. Edney): (http://www.technicalpursuit.com) -->

<xsl:stylesheet
	xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
	xmlns:html="http://www.w3.org/1999/xhtml"
	version="1.0">

	<xsl:output method="xml" indent="yes" />

	<xsl:template match="/">
		<html>
			<head>
				<title></title>
				<style type="text/css">
					body
					{
						color: #00f;
						font: 12px Tahoma, Verdana, Arial, Helvetica, sans-serif;
						margin: 0px;
						padding: 15px 75px 15px 10px;
						height: 100%;
					}

					ul
					{
						list-style: none outside;
					}

					li
					{
						list-style: none outside;
						margin-left: -28px;
						line-height: 1.25em;
					}

					.switch
					{
						color: #f00;
						font-family: "Lucida Typewriter","Lucida Console", Courier, monospace;
						padding-right: 5px;
					}

					a.parent-element
					{
						text-decoration: none;
						margin-left: -13px;
						width: 13px;
					}
				</style>
				<script type="text/javascript">
					function switchNode(nodeRef)
					{
							var div;
							var span;
							var display;
							var symbol;

							div = nodeRef.parentNode.getElementsByTagName("div").item(0);
							span = nodeRef.getElementsByTagName("span").item(0);
							display = div.style.display;
							symbol = (display == "none") ? "-" : "+";

							div.style.display = (display == "none") ? "block" : "none";
							span.replaceChild(document.createTextNode(symbol),span.childNodes.item(0));
					}
				</script>
			</head>
			<body>
				<table class="uor_table" cellpadding="3" cellspacing="0">
					<thead class="uor_table_title">
						<tr><td colspan="3">TIBET System Report - Hierarchical</td></tr>
					</thead>
					<tbody class="uor_table_data">
						<tr>
							<td style="width: 100%; height: 100%">
								<ul>
									<xsl:apply-templates select="/html:html/html:body/html:div[@id='Object']"/>
								</ul>
							</td>
						</tr>
					</tbody>
				</table>
			</body>
		</html>
	</xsl:template>

	<xsl:template match="html:div">
		<li>
			<xsl:choose>
				<xsl:when test="*">
					<xsl:variable name="typeName" select="@id" />
					<a href="javascript: void 0" onclick="switchNode(this); return false" class="parent-element">
						<span class="switch">-</span>
					</a>
					<a class="uor_table_link" href="javascript: void 0" onclick="top.tibet.$shell(':reflect &quot;{$typeName}&quot;.asType()',true,false,null,&quot;TSH&quot;)">
						<xsl:value-of select="@id"/>
					</a>
					<div>
						<ul>
							<xsl:apply-templates/>
						</ul>
					</div>
				</xsl:when>
				<xsl:otherwise>
					<xsl:variable name="typeName" select="@id" />
					<a class="uor_table_link" href="javascript: parent.$shell(':reflect &quot;{$typeName}&quot;.asType()',true,false,null,&quot;TSH&quot;)">
						<xsl:value-of select="@id"/>
					</a>
					<xsl:apply-templates/>
				</xsl:otherwise>
			</xsl:choose>
		</li>
	</xsl:template>

</xsl:stylesheet>
