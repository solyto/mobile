deploy:
	cd deployment && \
		ansible-playbook -i hosts.ini deploy.yml

audit:
	npm audit
	npm outdated

check:
	npm run lint
	npm run check
	npm test
