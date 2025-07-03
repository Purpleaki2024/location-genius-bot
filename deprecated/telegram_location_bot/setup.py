from setuptools import setup, find_packages

setup(
    name='telegram_location_bot',
    version='1.0.0',
    packages=find_packages(),
    include_package_data=True,
    install_requires=[
        'Flask',
        'python-dotenv',
        'pyTelegramBotAPI',
        'SQLAlchemy',
        'pyotp',
        'requests'
    ],
    description='Telegram bot with Flask-based admin dashboard for location lookup and user management',
    author='Your Name',
    author_email='you@example.com',
    url='https://github.com/yourname/telegram_location_bot',
    classifiers=[
        'Programming Language :: Python :: 3',
        'Framework :: Flask',
        'License :: OSI Approved :: MIT License'
    ]
)
