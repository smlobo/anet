package mil.dds.anet.test.resources;

import static org.assertj.core.api.Assertions.assertThat;

import java.net.URLEncoder;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import javax.ws.rs.client.Entity;
import javax.ws.rs.core.GenericType;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

import org.junit.Test;

import io.dropwizard.client.JerseyClientBuilder;
import io.dropwizard.util.Duration;
import mil.dds.anet.beans.Person;
import mil.dds.anet.beans.Person.Role;
import mil.dds.anet.beans.Person.Status;

public class PersonResourceTest extends AbstractResourceTest {
		
	public PersonResourceTest() { 
		if (client == null) { 
			config.setConnectionTimeout(Duration.seconds(10));
			config.setTimeout(Duration.seconds(30));
			client = new JerseyClientBuilder(RULE.getEnvironment()).using(config).build("person test client");
		}
	}

	@Test
	public void testCreatePerson() {
		Person jack = getJackJackson();
		Person admin = getArthurDmin();
		
		Person retPerson = httpQuery(String.format("/api/people/%d", jack.getId()), jack).get(Person.class); 	
    	assertThat(retPerson).isEqualTo(jack);
    	assertThat(retPerson.getId()).isEqualTo(jack.getId());
    	
    	Person newPerson = new Person();
    	newPerson.setName("testCreatePerson Person");
    	newPerson.setRole(Role.PRINCIPAL);
    	newPerson.setStatus(Status.ACTIVE);
    	newPerson.setBiography("Created buy the PersonResourceTest#testCreatePerson");
    	newPerson = httpQuery("/api/people/new", admin).post(Entity.json(newPerson), Person.class);
    	assertThat(newPerson.getId()).isNotNull();
    	assertThat(newPerson.getName()).isEqualTo("testCreatePerson Person");
    	
    	
    	newPerson.setName("testCreatePerson updated name");
    	Response resp = httpQuery("/api/people/update", admin)
    			.post(Entity.json(newPerson));
    	assertThat(resp.getStatus()).isEqualTo(200);
    	
    	retPerson = httpQuery(String.format("/api/people/%d", newPerson.getId()), jack).get(Person.class);
    	assertThat(retPerson.getName()).isEqualTo(newPerson.getName());
    }
	
//	@Test
//	public void testDeletePerson() { 
//        Person jack = client.target(
//                 String.format("http://localhost:%d/people/new", RULE.getLocalPort()))
//                .request()
//                .post(Entity.json(PersonTest.getJackJackson()), Person.class);
//        
//        Response response = client.target(String.format("http://localhost:%d/people/%d", RULE.getLocalPort(), jack.getId()))
//        	.request()
//        	.delete();
//        
//        assertThat(response.getStatus()).isEqualTo(200);
//        
//        response = client.target(String.format("http://localhost:%d/people/%d", RULE.getLocalPort(), jack.getId()))
//        	.request().get();
//        assertThat(response.getStatus()).isEqualTo(404);
//       
//	}
	
	@Test
	public void testSearchPerson() { 
		Person jack = getJackJackson();
			
		String query = "Bobtown";
		List<Person> searchResults = httpQuery("/api/people/search?q=" + URLEncoder.encode(query), jack)
				.get(new GenericType<List<Person>>() {});
		assertThat(searchResults.size()).isGreaterThan(0);
	}
    
	@Test
	public void viewTest() { 
		Person jack = getJackJackson();
		Response resp = httpQuery("/people/", jack, MediaType.TEXT_HTML_TYPE).get();
		assertThat(resp.getStatus()).isEqualTo(200);
		String respBody = getResponseBody(resp);
		assertThat(respBody).as("FreeMarker error").doesNotContain("FreeMarker template error");
		
		Pattern personIdPat = Pattern.compile("href=\"/people/([0-9]+)\"");
		Matcher personIdMat = personIdPat.matcher(respBody);
		assertThat(personIdMat.find());
		int personId = Integer.parseInt(personIdMat.group(1));
		
		resp = httpQuery("/people/new", jack, MediaType.TEXT_HTML_TYPE).get();
		assertThat(resp.getStatus()).isEqualTo(200);
		assertThat(getResponseBody(resp)).as("FreeMarker error").doesNotContain("FreeMarker template error");
		
		resp = httpQuery("/people/" + personId, jack, MediaType.TEXT_HTML_TYPE).get();
		assertThat(resp.getStatus()).isEqualTo(200);
		assertThat(getResponseBody(resp)).as("FreeMarker error").doesNotContain("FreeMarker template error");
		
		resp = httpQuery("/people/" + personId + "/edit", jack, MediaType.TEXT_HTML_TYPE).get();
		assertThat(resp.getStatus()).isEqualTo(200);
		assertThat(getResponseBody(resp)).as("FreeMarker error").doesNotContain("FreeMarker template error");
	}
	
}
